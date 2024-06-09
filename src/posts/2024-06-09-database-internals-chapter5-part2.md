<script context="module">
    export let metadata = {
        title: "Database Internalsの5章のメモ その2",
        date: "2024-06-09 16:00:00",
        description: "Database Internalsを読んでわかったことをまとめる。5章の同時実行制御とか分離レベルとか",
    };
</script>

## Serializability （直列化可能性）

並列に実行されたトランザクションの実行順序が、それぞれ直列に実行実行した結果と同じ結果になることを保証する性質

例えばA,B,Cという3つのトランザクションが同時に実行されるとこれの並び順は3!で6通り存在する。

Serializabilityが満たされていれば、その3つのトランザクションがその6通りの中のどれかの順番に実行されたのと同じ結果になる。

結構当たり前のように聞こえるけど、複数のトランザクションが同時に実行されてる時にこのSerializabilityを満たそうとするとパフォーマンスの課題があるので、このSerializabilityの性質が満たされないことが多い。

## Transaction Isolation

Serializabilityを満たそうとするとパフォーマンスの課題があるので、制約を緩和したい。SQL標準ではトランザクションがお互いにどれくらい分離される状態なのか複数の分離レベルという形で定義してある。

一番厳しい分離レベルのSerializableだとSerializabilityが保証されるがそれ以外では保証されない。

以下が分離レベルの一覧

- read uncommitted
- read committed
- repeatable read
- serializable

レベルによってはトランザクションがそれほど分離されてないので、実行中に、Serializabilityでは起こらない整合性や一貫性が損なわれるアノマリー（異常）が発生する。

## Anomaly

anomalyの種類

### Dirty Read

- 他のトランザクションのまだコミットされてない変更を読み取ること。

### Non-repeatable Read

- 同じトランザクション内で同じレコードを2回問い合わせたときに結果が変わること。

### Phantom Read

- 同じトランザクション内で同じ問い合わせをした際に、初回にはなかった行が現れること
    - Non-repeatable Readと似ているがこちらはレコードが変わってるのではなくて行が増えてる

### Lost Update

- 2つのトランザクションT1, T2がVの値を読み、そして書き込みをする時にどちらかの値しか反映されない

### Dirty Write

- Dirty Readした状態に基づいて値をコミットしてしまうこと

### Write Skew

- A1 + A2 ≥ 0のようにA1とA2が依存しあった条件を持ってる時にそれぞれA1, A2を個々に更新して、A1 + A2 ≥ 0のような整合性の制約を破ってしまうこと

## Isolation Level

それぞれの分離レベルについて

- read uncommitted
    - 最も弱いIsolation Level。あるトランザクションから他のトランザクションのコミットされてない変更を見ることができる
        - 上記のanomalyは全て起こる
- read committed
    - トランザクションが他のトランザクションのコミット後の変更のみを読み取る。
        - dirty readとdirty writeはおこらないがnon-repeatable readやphantom readは起こる
- repeatable read
    - read committedに加えて、同じトランザクション内で同じデータを読み取ると常に同じ結果が返される。
        - ファントムリードは起こる
- serializable
    - Serializabilityを保証する

それぞれの分離レベルでどのwriteのアノマリーが起こるかはちょっと調べきれてない

このほかにもsnapshot Isolationという分離レベルもある

## 実行制御

並列で実行されるtransactionをどうやって制御するのかって話

大きくは以下の3種類がある。

- OCC, Optimistic Concurrency Control
- MVCC, Multiversion Concurrency Control
- PCC, Pessimistic Concurrency Control

## Optimistic Concurrency Control（楽観的同時実行制御）

読み取り、検証、書き込みの3つのフェーズに分かれて実行される。読み取りフェーズでは必要な値を読み込んで、検証フェーズでそれが先に実行されたトランザクションとかと競合してないか調べる。もし競合してたら場合は読み取りフェーズからやり直し。

検証フェーズでOKが出たらその結果を書き込みフェーズで書き行む。

## Multiversion Concurrency Control（マルチバージョン同時実行制御）

レコードに複数のバージョンを持たせて、新しい値がコミットされるまでは古いバージョンにアクセスするようにする。

## Pessimistic Concurrency Control（悲観的同時実行制御）

実行中にトランザクションの競合を特定して、トランザクションの実行をブロックしたり、中断したりする。

ロックフリーなやり方とロックを使うやり方がある。

ロックフリーなやり方の場合は、トランザクションごとに開始時にtime stampを割り当てて、さらにそれぞれのレコードごとに、max_read_timestampとmax_write_timestampを割り当てる。

読み取りの時は、自身のトランザクションのタイムスタンプがmax_write_timestampより過去だった場合はトランザクションをやり直す。自身のトランザクションが開始してから値が書き込まれているのから。

書き込み時はreadとwriteのtimestampを両方考慮する

- max_read_timestampよりも過去に開始したtransactionはコンフリクトする。自分のトランザクションが始まってから、他のトランザクションが値をreadしてるということ。
    - 具体的にどう悪いのかはいまいち想像できてない
- max_write_timestampよりも過去に開始したtransactionは上書きして良いみたいな話になっているが、[wikipediaのThomasWriteRule](https://en.wikipedia.org/wiki/Thomas_write_rule)だと無視されるって意味合いっぽくてよくわかってない

上記のようにreadとかwrite時にtimestampをみてtransaction実行するかやり直すのか制御するのが（ほかにも実装方法はあるかもだけど）、ロックフリーなPCC

### ロックベースの同時実行制御

Pessimistic Concurrency Controlの一種

データベースのオブジェクトに対して明示的にロックを使用する。よく普及しているロックベースの技術がtwo phase lock（2PL, 2相ロック）

2PLではロックの管理が以下の2つのフェーズに分かれる

- growing or expanding phase: トランザクションよって必要となるロックを全て確保していき、この間はロックを解放しない
- shrinking phase: growing phaseの間に取得したロックを全て解放している

### デッドロック

2つ以上のトランザクションが必要なロックを取得していく最中にお互いが、お互いの必要なロックを確保してしまって、それ以上ロックを取得ができなく待機してしまう状態。

簡単な対処としてはタイムアウトなどで失敗にしてしまうことなどあるが、多くのデータベースシステムのトランザクションマネージャはデッドロックの検出or回避をする

そのためにどのトランザクションがどのトランザクションが取得しているロックを待っているかをグラフ化したwaits-for graphを利用する。

このグラフに循環があった場合はデッドロックが起きてしまっている。これを回避するために優先度を導入する。大抵の場合はtimestampがより過去のtransactionが優先度が高い。

まずトランザクションT1とトランザクションT2を考える。T1の方がT2よりも先にスタートしたのでT1の方が優先度が高いということにする。

デッドロックを避けるために以下の2パターンのどちらかを使う

- Wait-die
    - T1は待つことができる。よりT1より優先度の低いトランザクションがロックを持っているなら待つことができる。自身より優先度の高いトランザクションが取得しているロックは待つことができなくて、失敗にする
    - 自身より小さい優先度（大きいtimpstamp）のトランザクションにだけブロックされる
- Wound-wait
    - T1はT2をabortedしてリスタートさせる。優先度高いトランザクションが、自身よりも優先度が低いトランザクションが取得していたロックが必要な場合、そのロックを取得しているトランザクションをabortさせることができる。
    - 自身より優先度が高いトランザクションのロックが必要な場合は待つ
    - 自身よりも高い優先度（小さいtimpstamp）のトランザクションにだけブロックされる
