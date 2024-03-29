---
title: "ソフトウェアアーキテクチャの基礎を読んだ"
date: "2023-02-13 23:00:00"
---

[ソフトウェアアーキテクチャの基礎](https://www.oreilly.co.jp/books/9784873119823/)って本を読んだ。
最初は[ソフトウェアアーキテクチャ・ハードパーツ](https://www.oreilly.co.jp/books/9784814400065/)って本が気になって読もうと思ったんだけど、
基礎の方が前編みたいな感じらしいのでまずはそっちから読んだ。
内容はソフトウェアアーキテクチャについてとアーキテクトという職業について書いてある。そもそも個人的にはアーキテクチャの話に興味があり読み始めたということもあって、
アーキテクトの方はあんましピンとこないことが多かった。アーキテクチャの話は色々今まで断片的に知ってたこととが整理されてよかった。
色々なアーキテクチャが紹介されていて、今の自分の環境だといまいち使い所がわからないアーキテクチャとかもあったけどそれも含めて勉強にはなった。気がする。

ただこの本に全体を通して、アーキテクトはこういうことを考えなきゃいけないみたいな感じで話が進んでいるのだけど、著者が指しているアーキテクトという職種が、
自分の身近にいなさすぎてあまり想像できなかった。本を読んで感じたなんとなくイメージはSIとかの上流工程の人って感じ。
自分が働いている環境だとアーキテクトって人はいなくて、開発の担当者とかがアーキテクチャを決めたりするから、設計だけして手をあまし動かさない働き方ってのが想像しにくかった。

# 備忘録

ふんわりとした記憶をもとに書いてるので、嘘が入ってるかもしれない。

## 1部

実際のアーキテクチャの話に入る前に、アーキテクチャを考える上でどういった要素に気をつけいないといけないとか、そういった話が書いてある。
アーキテクチャには、例えばアーキテクチャはデプロイがしやすいとか、開発がしやすいとか、スケーラビリティが良いとか、色々特性があって、
考えてるアーキテクチャが満たさなきゃいけない特性をちゃんと満たしているかとかをちゃんと考えながらアーキテクチャを考えないといけない。

あとモジュールの依存の話も書いてあった。依存にも色々なパターンがあって、コードが直接依存していたり、外部呼び出しのインターフェースに依存していたり。
こういうのを網羅的に定義してあって、さらに数値化する方法も紹介されていた。ただこうゆうのってちゃんとやるのは大変で、実際に定期的に数値分析して、
結合度が高いからリファクタするとかみたいな開発サイクルを回している所が存在しているのか気になる。

## 2部

実際にいろんなアーキテクチャが紹介されている。個人的に面白かったのはスペースベースアーキテクチャ。
スペースベースアーキテクチャは基本的はデータは全て、データは全て[Apache Ignite](https://ignite.apache.org/)みたいなIn memoryのDBに保存されて、
それが裏で非同期的に永続化ようのDBに書き込むみたいな感じらしい。どこが落ちてもデータをちゃんと永続化するのはとても難しそう。
一回こういう形のソフトウェアの開発に携わってみたいけど、 データの永続化が難しそうなので普通のWebサービスとか作ってると採用する機会はなさそう。
よほどパフォーマンスとかを重視して、その難しさをなんとかするコストを払ってもペイする環境じゃないと厳しい。

無難なのはサービスベースアーキテクチャで馴染みが深い。それ以上のことはあまりない。
レイヤードアーキテクチャはレイヤーごとに開発者が違うのが本だと前提になっていて、でかい開発チームだとSQLとかを管理するDBAとか、
UIとかそれぞれでチームが別れるのやっぱ普通にあるんだろうなーって思った。担当の開発者がある程度SQLからWebのUIまで見るっていう環境で育ってきたので、
こういう開発体制の話は新鮮だった。

イベント駆動アーキテクチャもピタゴラスイッチっぽくて好き。一個一個は小さくなりそうなのでコードはテストしやすいしシンプルになりそう。
だけど全部の面倒を見るのは結構地獄になる気がしている。遠いところに依存があって簡単な変更でもデプロイまで考えると結構手間だったり、
手元で全部通して動かすのが大変だったりとかありそう。プロダクションでは結構開発環境の整備に力を入れることができないなら手を出したくない。
ピタゴラスイッチっぽく処理が流れていくのは好きだけど。

最後にマイクロサービスの紹介があった。中でもコレオグレフィとオーケストレーションっていう考え方はあまり意識したことがなかったのでよかった。

## 3部

アーキテクトとしての振る舞いについて書いてなる。チームの開発者として役に立ちそうなことは書いてあるけど、あんまししっくりこないこともある。
なんとなく出世するにはこういう振る舞いをしないといけない的な自己啓発みがあるから、無意識にしっくりこないだけかもしれない。