<script context="module">
    export let metadata = {
        title: "ansibleをテストするためにqemuを使ってみた",
        date: "2025-04-25 14:00:00",
        description: "ansibleをテストするためにqemuを使ってみた",
    };
</script>

なんか最近はDockerを使うことが多くなったけど、ansibleをいじる必要が出てきてその場合にdocker環境だとsystemdとかないのでうまくいかない。頑張れうまくいくのかも知らんけど。
intel macだった頃はvirtual boxが使えたみたいだけど、apple siliconになってからは動かない気がしたのでqemuを試してみる。

## Imageのダウンロードとkeyの作成

[https://rockylinux.org/download](https://rockylinux.org/download)からイメージを落としてきて、imageに入れておくssh keyを作る

```shell
curl -L -O https://dl.rockylinux.org/pub/rocky/9/images/aarch64/Rocky-9-GenericCloud-Base.latest.aarch64.qcow2
ssh-keygen -t rsa -b 4096 -C "rocky@qemu" -f ./rocky_qemu_key
```

## Cloud-initで使用するfileの作成

ダウンロードしたimageにuserを作成して、その先ほど作成したssh keyを入れるために[cloud-init](https://cloud-init.io/)を使う。

以下の2つのファイルを用意する。(meta-dataの方はいらないかも)

* user-data
* meta-data


### user-data

ssh-authorized-keysの方は先ほど作成した公開鍵の内容を入れる

```yaml
#cloud-config:
users:
  - name: rocky
    ssh-authorized-keys:
      - ssh-rsa xxxxx
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    shell: /bin/bash
```

### meta-data

```yaml
# meta-data
instance-id: rocky-vm
local-hostname: rocky
```

そして、この2つをもとにcloud-initで使用できるようにimageに変換する。imageに変換するには`cloud-localds`というコマンドが必要。
macでもできるかもしれないけど、commandのインストールの仕方がわからなかったのでdockerで実行する。

```shell
docker run --rm -it -v $(pwd):/workspace ubuntu:22.04 /bin/bash
```

カレントディレクトリに`user-data`と`meta-data`のファイルを置いておく。

```shell
# In docker
apt update && apt install -y cloud-image-utils
cd /workspace
cloud-localds my-seed.img user-data meta-data
```

これが終わると`my-seed.img`がホストと共有しているディレクトリに出てくる


## qemuの実行

以下のコマンドを実行すれば良い。これはhomebrewでqemuをinstallしていて、その`edk2-aarch64-code.fd`を指定しているけど、これがなんなのかは分かってない。
`highmem`というオプションはm1 macだとないので消さないといけない（はず?）。ただこれをonにしないとmemoryを大きくできないとかだった気がする。

```shell
qemu-system-aarch64 \
  -machine virt,accel=hvf,highmem=off \
  -cpu host \
  -smp 2 -m 2048 \
  -drive if=pflash,format=raw,readonly=on,file=$(brew --prefix)/share/qemu/edk2-aarch64-code.fd \
  -drive file=Rocky-9-GenericCloud-Base.latest.aarch64.qcow2,if=virtio,format=qcow2 \
  -nic user,hostfwd=tcp::2222-:22 \
  -drive file=my-seed.img,if=virtio,format=raw \
  -nographic -serial mon:stdio
```

これを実行するとvmが立ち上がるので、以下のコマンドでsshできる。(`-o StrictHostKeyChecking=no`はいらない)

```shell
ssh -o StrictHostKeyChecking=no -i rocky_qemu_key -p 2222 rocky@127.0.0.1
```

ansibleで繋ぐ場合は`inventory.yml`こんな感じ

```yaml
local:
  hosts:
    qemu.loal:
      ansible_host: 127.0.0.1
      ansible_user: rocky
      ansible_port: 2222
      ansible_ssh_private_key_file: ./keys/rocky_qemu_key
      ansible_ssh_common_args: '-o StrictHostKeyChecking=no' # 基本はいらない
```

```shell
 $ ansible -i inventory.yml local -m ping
 qemu.loal | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```