<script context="module">
    export let metadata = {
        title: "std::condition_variableについて",
        date: "2023-12-31 17:00:00",
        description: "std::condition_variableについて調べてわかったこと",
    };
</script>

td::condition_variableとはc++のマルチスレッドで使われる機能。他から起こされるまで、処理を止めて寝かすことができる。

簡単な例はこんな感じ

```cpp
#include <thread>
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <chrono>

std::mutex mtx;
std::condition_variable cv;
std::queue<int> buffer;

void consumer(std::unique_lock<std::mutex> &lck) {
    while(true) {
        // threadの処理を止めて、mutexを解放する
        // cvのnotifyメソッドが呼ばれるかOSの都合でthreadが起動したら、mutexを取得。（できなければ待つ）
        // そして、第二引数のlamdbaを実行しtrueであれば、その後の処理を実行。
        // falseの場合は、再び処理を止めてmutexを解放する
        cv.wait(lck, [] { return !buffer.empty(); });
        std::cout << "wake up!" << std::endl;
        while (!buffer.empty()) {
            std::cout << "- consume value = " << buffer.front() << std::endl;
            buffer.pop();
        }
    }
}

void produce(const int val) {
    std::lock_guard<std::mutex> lck(mtx);
    std::cout << "produce value = " << val << std::endl;
    buffer.push(val);
    cv.notify_one();
}

int main() {
    // consumer threadが起動する前にproduceが呼ばれるのを防ぐために、
    // ここでロックをとってconsumerに渡している（良いやり方なのかはわかってない）
    std::unique_lock<std::mutex> lck(mtx);
    std::thread consumer_thread(consumer, std::ref(lck));

    produce(1);
    std::this_thread::sleep_for(std::chrono::seconds(5));
    produce(2);
    std::this_thread::sleep_for(std::chrono::seconds(5));
    produce(3);

    consumer_thread.join();
    return 0;
}
```

consumer関数の長々とコメントを書いた `cv.wait` 部分が大事なところ。

達成したいことは、複数のスレッドから `buffer` に読み書きするのでそこの操作の排他制御。

consumer側は `buffer` に値が入った時にそこから値を取り出したいけど、いつ値が入るかわからない。ずっと待っていてもリソースが勿体無いので、処理を中断して、値を書き込んだタイミングで別のスレッドから起こしてもらうようにする。そしてこの起きたタイミングでmutexを取得してqueueの読み書きの権限を取得して操作する。

この処理をまとめてやってくれるのが、condition_variable

`cv.wait()` を呼んで処理を中断して、その後外部から起こされると、その時には必要なmutexを取得した状態で処理を実行できる。

ただし、OS都合?でnotifyが呼ばれなくてもスレッドが起きてしまう現象( [Squrious wakeup](https://en.wikipedia.org/wiki/Spurious_wakeup) )があるので、第二引数にスレッドが起きる条件を指定しておくと、その条件に当てはまらない場合はもう一度処理を中断する。
