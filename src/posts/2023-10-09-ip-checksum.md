<script context="module">
    export let metadata = {
        title: "IPのチェックサムについて",
        date: "2023-10-09 17:00:00",
        description: "IPのパケットのチェックサムについて調べた。",
    };
</script>

TCP/IPのプロトコルスタックを実装していて、その過程でIPのチェックサムがよくわからんかったので調べたメモ

## チェックサムのロジック

チェックサムを求める時

* チェックサムのフィールドを0にする
* データを16bitごとに区切って整数として、それぞれの整数を1の補数和を計算する
* その補数和の1の補数をチェックサムのフィールドに書き込む

検証する時

* データを16bitごとに区切って整数として、それぞれの整数を1の補数和を計算する
* その結果が全てのbitが1だったらチェックは成功

## 1の補数の性質

1の補数を計算するとバイトオーダーを気にしなくて良いみたいのが説明にあるのだけどそれがわからなかったので色々調べた。

まず前提としてメモリ上のデータの配置をそのまま16bitの整数とみなして計算しているのがポイント。低レイヤーの世界では当たり前っぽいけど、自分の中ではこのような考えがあまりなかった。

メモリに以下みたいにバイト列があったら、それを無理やり16bitの整数とみなす。その時にバイトオーダーによって整数の認識が変わる。

```text
+------+
| 0x01 | <- ここから16bitの整数
| 0xf0 |
| 0x11 | <- ここから16bitの整数
| 0x2b |
+------+

ビッグエンディアンだと最初の整数は 0x01f0
リトルエンディアンだと最初の整数は 0xf001
とCPUが認識する
```

CPUによってバイトオーダーが違う場合があって1の補数和を使うことで、この送信元と受信先でバイトオーダーが違っていても、最終的な結果を同じにすることができる。
今の世の中だと基本リトルエンディアンらしいけど、昔は多分多様性があったんだろう。

8bitで1byteだと例が長くなるので、一旦4bitで1byteとして考える。
1の補数和とあるが、要はやっていることはbitの足し算をして一番左のbitに繰り上がりが発生したら、最下位bitに繰り上がり分を足せば良い。

```text
  1110
+ 1001
-------
 10111

一番左の繰り上がりを最下位bitに足しての以下ようになる

  0111
+    1
-------
  1111
```

このように繰り上がりが消えないので、例えば2byte(16bit)の整数なら、下位8bit同士の足し算の繰り上がりは上位bitに足され、
上位8bit同士の足し算の繰り上がりは下位bitに足させる。よって、バイトオーダーが異なり上位と下位が入れ替わったとしても、
計算結果の上位bitの構造がそのまま下位bitにいき、下位bitの構造はそのまま上位bitに移る。

```text
(1byte 4bitの世界)

+-----+
| 0x1 | <- ここから16bitの整数
| 0xf |
| 0x5 | <- ここから16bitの整数
| 0xa |
+-----+

こうゆうのがあった時に、ビッグエンディアンでは以下のような足し算になる
  (0x1f) 0001  1111
+ (0x5a) 0101  1010
-------------------
         0110 11001
繰り上がりを計算
         0111  1001

リトルエンディアンでは
  (0xf1) 1111  0001
+ (0x5a) 1010  0101
-------------------
        11001  0110
1の補数和なので最上位の繰り上がりは最下位に足す
         1001  0111
```

チェックサムは送信元でデータの1の補数和を計算して、チェックサムをその和の1の補数(bitを判定したもの)とするので、
データが壊れてなければそのデータを全て足したとき（1の補数和）に全てのbitが１になる。

バイトオーダーが違っても上位bitと下位bitの構造そのものは変わらず入れ方ってるだけなので、全ての補数和を取ると結果の値は全て1bitが立っていることになる。
上記のように1の補数を使うとバイトオーダーを気にせずにチェックサムを計算できる。