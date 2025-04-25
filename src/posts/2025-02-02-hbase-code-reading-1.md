<script context="module">
    export let metadata = {
        title: "HBase Code Reading 1",
        date: "2025-02-02 14:00:00",
        description: "HBaseのコードを読む。リージョンを移動させるところから",
    };
</script>

# hbaseのリージョンを移動させるときにどのようになっているか調べる

hbase shellを実行するときはおそらくまず[この部分](https://github.com/apache/hbase/blob/cb821495bad3b054a9dfc11e475d148621705990/bin/hbase#L523-L540)で実行するクラスを選択。shellの場合は `org.jruby.JarBootstrapMain`。

```shell
if [ "$COMMAND" = "shell" ] ; then
	#find the hbase ruby sources
  # assume we are in a binary install if lib/ruby exists
  if [ -d "$HBASE_HOME/lib/ruby" ]; then
    # We want jruby to consume these things rather than our bootstrap script;
    # jruby will look for the env variable 'JRUBY_OPTS'.
    JRUBY_OPTS="${JRUBY_OPTS} -X+O"
    export JRUBY_OPTS
    # hbase-shell.jar contains a 'jar-bootstrap.rb'
    # for more info see
    # https://github.com/jruby/jruby/wiki/StandaloneJarsAndClasses#standalone-executable-jar-files
    CLASS="org.jruby.JarBootstrapMain"
  # otherwise assume we are running in a source checkout
  else
    HBASE_OPTS="$HBASE_OPTS -Dhbase.ruby.sources=$HBASE_HOME/hbase-shell/src/main/ruby"
    CLASS="org.jruby.Main -X+O ${JRUBY_OPTS} ${HBASE_HOME}/hbase-shell/src/main/ruby/jar-bootstrap.rb"
  fi
  HBASE_OPTS="$HBASE_OPTS $HBASE_SHELL_OPTS"
```

そして[ここで](https://github.com/apache/hbase/blob/cb821495bad3b054a9dfc11e475d148621705990/bin/hbase#L810-L815)そのクラスを実行

```shell
if [ "${HBASE_NOEXEC}" != "" ]; then
  "$JAVA" -Dproc_$COMMAND -XX:OnOutOfMemoryError="kill -9 %p" $HEAP_SETTINGS $HBASE_OPTS $CLASS "$@"
else
  export JVM_PID="$$"
  exec "$JAVA" -Dproc_$COMMAND -XX:OnOutOfMemoryError="kill -9 %p" $HEAP_SETTINGS $HBASE_OPTS $CLASS "$@"
fi
```

このときにirbが立ち上がっている気がする

irbでhbaseのコマンドを実行できるけどそれはおそらく[ここに](https://github.com/apache/hbase/blob/6006eba90ff946884620c749c44123816fe779ab/hbase-shell/src/main/ruby/shell.rb#L442-L493)定義されている

コマンドを実際に実行しているのは[ここ](https://github.com/apache/hbase/blob/6006eba90ff946884620c749c44123816fe779ab/hbase-shell/src/main/ruby/shell.rb#L66)

```ruby
require "shell/commands/#{name}"
klass_name = name.to_s.gsub(/(?:^|_)(.)/) { Regexp.last_match(1).upcase } # camelize
commands[name] = eval("Commands::#{klass_name}")
aliases.each do |an_alias|
  commands[an_alias] = commands[name]
end
```

これは特定のコマンドのrubyのファイルを読んで実行していて、 [moveコマンドはこれ](https://github.com/apache/hbase/blob/97a32318fdf2e36e6005e1c84605dc56481b116c/hbase-shell/src/main/ruby/shell/commands/move.rb#L41)

```ruby
def command(encoded_region_name, server_name = nil)
  admin.move(encoded_region_name, server_name)
end
```

これはおそらく以下の`admin.move`を実行している

https://github.com/apache/hbase/blob/88e9477f8b49df99552d1a0278b9edd0f47def1f/hbase-shell/src/main/ruby/hbase/admin.rb#L568

```ruby
#----------------------------------------------------------------------------------------------
# Move a region
def move(encoded_region_name, server = nil)
  @admin.move(encoded_region_name.to_java_bytes, server ? server.to_java_bytes : nil)
end
```


`@admin`は以下のconnectionの中にで[これはコメントによるとjavaのAdmin instance](https://github.com/apache/hbase/blob/88e9477f8b49df99552d1a0278b9edd0f47def1f/hbase-shell/src/main/ruby/hbase/admin.rb#L36)

```ruby
def initialize(connection)
  @connection = connection
  # Java Admin instance
  @admin = @connection.getAdmin
  @hbck = @connection.getHbck
  @conf = @connection.getConfiguration
end
```

この`@connection.getAdmin`は以下のファクトリで生成されるコネクションクラスが提供している

https://github.com/apache/hbase/blob/97a32318fdf2e36e6005e1c84605dc56481b116c/hbase-shell/src/main/ruby/hbase/hbase.rb#L35

```ruby
module Hbase
  class Hbase
    attr_accessor :configuration

    def initialize(config = nil)
      # Create configuration
      if config
        self.configuration = config
      else
        self.configuration = HBaseConfiguration.create
        # Turn off retries in hbase and ipc.  Human doesn't want to wait on N retries.
        configuration.setInt('hbase.client.retries.number', 7)
        configuration.setInt('hbase.ipc.client.connect.max.retries', 3)
      end
      @connection = ConnectionFactory.createConnection(configuration)
    end

    # Returns ruby's Admin class from admin.rb
    def admin
      ::Hbase::Admin.new(@connection)
    end
```

`ConnectionFactory`はjavaのクラスをimportしているのでjava

```
include Java
java_import org.apache.hadoop.hbase.client.ConnectionFactory
java_import org.apache.hadoop.hbase.HBaseConfiguration
```

`createConnection`はConnection型を返す

https://github.com/apache/hbase/blob/02dd2567037f15daaccc4c6c00a246eba2bbecd7/hbase-client/src/main/java/org/apache/hadoop/hbase/client/ConnectionFactory.java#L215


```java
public static Connection createConnection(Configuration conf, ExecutorService pool,
    final User user) throws IOException
```

Connection型は以下で定義されていて、`getAdmin`は以下のメソッド。region moveはこの中のmoveメソッドが呼ばれる

https://github.com/apache/hbase/blob/b9a13eba67433971c4590e7f999ccbfefd6315a0/hbase-client/src/main/java/org/apache/hadoop/hbase/client/Connection.java#L51
https://github.com/apache/hbase/blob/b9a13eba67433971c4590e7f999ccbfefd6315a0/hbase-client/src/main/java/org/apache/hadoop/hbase/client/Connection.java#L156

```java
Admin getAdmin() throws IOException;
```

なのでmoveを実行するのは[Adminインターフェース](https://github.com/apache/hbase/blob/05c533b7c022ef860bedb6eb28ce2780cf1dd2d4/hbase-client/src/main/java/org/apache/hadoop/hbase/client/Admin.java#L86)に定義されているmoveメソッド。

そして実際にmoveメソッドを実装しているのは、`HBaseAdmin`[クラスの実装](https://github.com/apache/hbase/blob/8c2dd12adbc3b30c079554c6073663d0649d055d/hbase-client/src/main/java/org/apache/hadoop/hbase/client/HBaseAdmin.java#L1383)

```java
@Override
public void move(byte[] encodedRegionName) throws IOException {
  move(encodedRegionName, (ServerName) null);
}
public void move(final byte[] encodedRegionName, ServerName destServerName) throws IOException {
  executeCallable(new MasterCallable<Void>(getConnection(), getRpcControllerFactory()) {
    @Override
    protected Void rpcCall() throws Exception {
      setPriority(encodedRegionName);
      MoveRegionRequest request =
        RequestConverter.buildMoveRegionRequest(encodedRegionName, destServerName);
      master.moveRegion(getRpcController(), request);
      return null;
    }
  });
}
```

なのでHbase shellでregionをmoveするときは最終的に、masterにmoveRegionするRPCを送っている

executeCallableはrpcCallerを作って、[それがリトライつきでcallableを実行できる?](https://github.com/apache/hbase/blob/8c2dd12adbc3b30c079554c6073663d0649d055d/hbase-client/src/main/java/org/apache/hadoop/hbase/client/HBaseAdmin.java#L2954)


```java
static private <C extends RetryingCallable<V> & Closeable, V> V executeCallable(C callable,
  RpcRetryingCallerFactory rpcCallerFactory, int operationTimeout, int rpcTimeout)
  throws IOException {
  RpcRetryingCaller<V> caller = rpcCallerFactory.newCaller(rpcTimeout);
  try {
    return caller.callWithRetries(callable, operationTimeout);
  } finally {
    callable.close();
  }
}
```

https://github.com/apache/hbase/blob/fb2593b840bb3b53a0babe1a91a9613dc9c47a47/hbase-client/src/main/java/org/apache/hadoop/hbase/client/RpcRetryingCallerImpl.java#L104

```java
public T callWithRetries(RetryingCallable<T> callable, int callTimeout)
  throws IOException, RuntimeException {
  List<RetriesExhaustedException.ThrowableWithExtraContext> exceptions = new ArrayLis
  tracker.start();
  context.clear();
  for (int tries = 0;; tries++) {
    long expectedSleep;
    try {
      // bad cache entries are cleared in the call to RetryingCallable#throwable() in
      callable.prepare(tries != 0);
      interceptor.intercept(context.prepare(callable, tries));
      return callable.call(getTimeout(callTimeout));
```


この`callable`は`MasterCallable`で`rpcCall`を実行している


```java
public V call(int callTimeout) throws IOException {
  try {
    if (this.rpcController != null) {
      this.rpcController.reset();
      this.rpcController.setCallTimeout(callTimeout);
    }
    return rpcCall();
  } catch (Exception e) {
    throw ProtobufUtil.handleRemoteException(e);
  }
}
```

なので、moveの中の`rpcCall`が[実行している`master.moveRegion`が実際にmoveをいっていそう](https://github.com/apache/hbase/blob/8c2dd12adbc3b30c079554c6073663d0649d055d/hbase-client/src/main/java/org/apache/hadoop/hbase/client/HBaseAdmin.java#L1394)

このmaster.moveRegionは[ThriftのRPC](https://github.com/apache/hbase/blob/26e9c5b3ceac09f397a8dac08ef19378e63fcc69/hbase-protocol-shaded/src/main/protobuf/Master.proto#L762-L764)

```thrift
/** Move the region region to the destination server. */
rpc MoveRegion(MoveRegionRequest)
  returns(MoveRegionResponse);
```

RPCを実装しているmoveRegionのハンドラは[おそらくここ](https://github.com/apache/hbase/blob/37d62aabbd2ae2eb8cf80b024fc4f4a9dbaec2f1/hbase-server/src/main/java/org/apache/hadoop/hbase/master/MasterRpcServices.java#L1396)

```java
public MoveRegionResponse moveRegion(RpcController controller, MoveRegionRequest req)
  throws ServiceException {
  final byte[] encodedRegionName = req.getRegion().getValue().toByteArray();
  RegionSpecifierType type = req.getRegion().getType();
  final byte[] destServerName = (req.hasDestServerName())
    ? Bytes.toBytes(ProtobufUtil.toServerName(req.getDestServerName()).getServerName())
    : null;
  MoveRegionResponse mrr = MoveRegionResponse.newBuilder().build();
  if (type != RegionSpecifierType.ENCODED_REGION_NAME) {
    LOG.warn("moveRegion specifier type: expected: " + RegionSpecifierType.ENCODED_REGION_NAME
      + " actual: " + type);
  }
  try {
    master.checkInitialized();
    master.move(encodedRegionName, destServerName);
  } catch (IOException ioe) {
    throw new ServiceException(ioe);
  }
  return mrr;
}
```

実際に処理を行ってそうな`master.move(encodedRegionName, destServerName);`[これは`HMaster.java`にある](https://github.com/apache/hbase/blob/ee2d21a41134a3e3ca627edcb0913ed5bc03723c/hbase-server/src/main/java/org/apache/hadoop/hbase/master/HMaster.java#L2004)

色々チェックをして、実際に移動させてるのは`HMaster.java`の以下の部分

```java
// Now we can do the move
RegionPlan rp = new RegionPlan(hri, regionState.getServerName(), dest);
assert rp.getDestination() != null : rp.toString() + " " + dest;
try {
  checkInitialized();
  if (this.cpHost != null) {
    this.cpHost.preMove(hri, rp.getSource(), rp.getDestination());
  }
  TransitRegionStateProcedure proc =
    this.assignmentManager.createMoveRegionProcedure(rp.getRegionInfo(), rp.getDestination());
  // Warmup the region on the destination before initiating the move. this call
  // is synchronous and takes some time. doing it before the source region gets
  // closed
  serverManager.sendRegionWarmup(rp.getDestination(), hri);
  LOG.info(getClientIdAuditPrefix() + " move " + rp + ", running balancer");
  Future<byte[]> future = ProcedureSyncWait.submitProcedure(this.procedureExecutor, proc);
  try {
    // Is this going to work? Will we throw exception on error?
    // TODO: CompletableFuture rather than this stunted Future.
    future.get();
  } catch (InterruptedException | ExecutionException e) {
    throw new HBaseIOException(e);
  }
  if (this.cpHost != null) {
    this.cpHost.postMove(hri, rp.getSource(), rp.getDestination());
  }
} catch (IOException ioe) {
  if (ioe instanceof HBaseIOException) {
    throw (HBaseIOException) ioe;
  }
  throw new HBaseIOException(ioe);
}
```

Procedureというタスクをオーケストレーションを管理してくれるフレームワークを使っている。
[このチケット](https://issues.apache.org/jira/browse/HBASE-12439)の中の`ProcedureV2b.pdf`というドキュメントがわかりやすい

処理は`proc`が持っていて、[`this.assignmentManager.createMoveRegionProcedure(rp.getRegionInfo(), rp.getDestination());`で作成している。](https://github.com/apache/hbase/blob/cd3a83fb6dcf1d8e22a7fd5a12caa222df5b7667/hbase-server/src/main/java/org/apache/hadoop/hbase/master/assignment/AssignmentManager.java#L721)

```java
public TransitRegionStateProcedure createMoveRegionProcedure(RegionInfo regionInfo,
  ServerName targetServer) throws HBaseIOException {
  RegionStateNode regionNode = this.regionStates.getRegionStateNode(regionInfo);
  if (regionNode == null) {
    throw new UnknownRegionException(
      "No RegionStateNode found for " + regionInfo.getEncodedName() + "(Closed/Deleted?)");
  }
  TransitRegionStateProcedure proc;
  regionNode.lock();
  try {
    preTransitCheck(regionNode, STATES_EXPECTED_ON_UNASSIGN_OR_MOVE);
    regionNode.checkOnline();
    proc = TransitRegionStateProcedure.move(getProcedureEnvironment(), regionInfo, targetServer);
    regionNode.setProcedure(proc);
  } finally {
    regionNode.unlock();
  }
  return proc;
}
```

この部分で`proc`を受け取っている

```java
proc = TransitRegionStateProcedure.move(getProcedureEnvironment(), regionInfo, targetServer);
```

[`TransitRegionStateProcedure.move`は以下のような処理](https://github.com/apache/hbase/blob/02dd2567037f15daaccc4c6c00a246eba2bbecd7/hbase-server/src/main/java/org/apache/hadoop/hbase/master/assignment/TransitRegionStateProcedure.java#L594)

```java
public static TransitRegionStateProcedure move(MasterProcedureEnv env, RegionInfo region,
  @Nullable ServerName targetServer) {
  return setOwner(env, new TransitRegionStateProcedure(env, region, targetServer,
    targetServer == null, TransitionType.MOVE));
}
```

[`TransitRegionStateProcedure`クラス](https://github.com/apache/hbase/blob/02dd2567037f15daaccc4c6c00a246eba2bbecd7/hbase-server/src/main/java/org/apache/hadoop/hbase/master/assignment/TransitRegionStateProcedure.java#L103)が作られている

`TransitRegionStateProcedure.execute`を実行すると、その先で`executeFromState`が実行されて、これでタスクをstateMachineのように管理する

https://github.com/apache/hbase/blob/02dd2567037f15daaccc4c6c00a246eba2bbecd7/hbase-server/src/main/java/org/apache/hadoop/hbase/master/assignment/TransitRegionStateProcedure.java#L336

```java
protected Flow executeFromState(MasterProcedureEnv env, RegionStateTransitionState state)
  throws ProcedureSuspendedException, ProcedureYieldException, InterruptedException {
  RegionStateNode regionNode = getRegionStateNode(env);
  try {
    switch (state) {
      case REGION_STATE_TRANSITION_GET_ASSIGN_CANDIDATE:
        // Need to do some sanity check for replica region, if the region does not exist at
        // master, do not try to assign the replica region, log error and return.
        if (!RegionReplicaUtil.isDefaultReplica(regionNode.getRegionInfo())) {
          RegionInfo defaultRI =
            RegionReplicaUtil.getRegionInfoForDefaultReplica(regionNode.getRegionInfo());
          if (
            env.getMasterServices().getAssignmentManager().getRegionStates()
              .getRegionStateNode(defaultRI) == null
          ) {
            LOG.error(
              "Cannot assign replica region {} because its primary region {} does not exist.",
              regionNode.getRegionInfo(), defaultRI);
            regionNode.unsetProcedure(this);
            return Flow.NO_MORE_STATE;
          }
        }
        queueAssign(env, regionNode);
        return Flow.HAS_MORE_STATE;
      case REGION_STATE_TRANSITION_OPEN:
        openRegion(env, regionNode);
        return Flow.HAS_MORE_STATE;
      case REGION_STATE_TRANSITION_CONFIRM_OPENED:
        return confirmOpened(env, regionNode);
      case REGION_STATE_TRANSITION_CLOSE:
        closeRegion(env, regionNode);
        return Flow.HAS_MORE_STATE;
      case REGION_STATE_TRANSITION_CONFIRM_CLOSED:
        return confirmClosed(env, regionNode);
      default:
        throw new UnsupportedOperationException("unhandled state=" + state);
    }
  } catch (IOException e) {
```

コメントにある通り、regionの移動は次のようになっている

https://github.com/apache/hbase/blob/02dd2567037f15daaccc4c6c00a246eba2bbecd7/hbase-server/src/main/java/org/apache/hadoop/hbase/master/assignment/TransitRegionStateProcedure.java#L88

```
CLOSE -----> CONFIRM_CLOSED -----> GET_ASSIGN_CANDIDATE ------> OPEN -----> CONFIRM_OPENED
```