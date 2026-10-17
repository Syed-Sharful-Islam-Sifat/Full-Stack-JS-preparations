# Database Internals

## How a Database Processes a Query

```
Tokenization -> Parser -> Optimizer -> Execution Engine
   (query executor -> cache manager, utility services (authentication),
    transaction management, lock management, recovery manager (database crashed),
    concurrency manager, storage engine (disk storage manager) -> loads from disk into memory,
    buffer manager, index manager, OS interaction layer,
    shard manager, cluster manager, replication manager)
```

Below is what each stage/component in that pipeline actually does:

### Tokenization

Breaks the raw SQL query string into meaningful tokens — keywords, identifiers, literals, operators — e.g. `SELECT`, `users`, `=`, `'abc'`. It's the same idea as tokenizing text for an LLM: convert raw characters into a stream of recognizable symbols the next stage can reason about.

### Parser

Takes the token stream and checks it against SQL grammar rules, building a parse tree (an abstract syntax tree) that represents the query's structure — which columns belong to which table, how the WHERE clause's conditions nest. If the syntax is invalid, this is the stage that throws a syntax error.

### Optimizer

Given a valid parse tree, there are usually multiple ways to physically run the same query (scan the whole table vs. use an index, join order A vs. B). The optimizer estimates the cost of each candidate plan — using table statistics like row counts and index cardinality — and picks the cheapest one. This is where the database decides **how** to run your query, even though you only told it **what** you want.

### Execution Engine (Query Executor)

Runs the plan the optimizer chose — iterating over rows, applying filters, performing joins, and producing the final result set. It's the component that calls down into every manager below (storage engine, buffer manager, lock manager, etc.) to actually fetch and manipulate data.

### Cache Manager

Keeps frequently accessed data — query results, parsed plans, or hot rows/pages — in memory so repeated requests skip the expensive disk and planning path. A cache hit means never going all the way down to the storage engine.

### Utility Services (Authentication)

Handles cross-cutting concerns that aren't about query execution itself but gate access to it: authenticating the connecting client, authorizing which operations/tables that client's role can touch, and logging/auditing activity.

### Transaction Management

Groups a sequence of operations into a single atomic unit (a transaction) that either fully commits or fully rolls back, enforcing the **ACID** properties. This is the component that tracks transaction boundaries (`BEGIN`/`COMMIT`/`ROLLBACK`) and coordinates with the lock manager and recovery manager to make that guarantee hold.

### Lock Management

Controls concurrent access to the same data — row-level or table-level locks — so two transactions writing to the same row don't corrupt each other's changes. Isolation levels (read committed, serializable, etc.) and deadlock detection also live here.

### Recovery Manager

If the database crashes mid-transaction (power loss, process kill), the recovery manager brings it back to a consistent state on restart — typically using a write-ahead log (WAL): replaying committed transactions that didn't make it to disk, and undoing uncommitted ones.

### Concurrency Manager

Coordinates multiple transactions running at the same time so they don't interfere with each other beyond what the chosen isolation level allows. Closely tied to the lock manager, but also covers techniques like **MVCC** (Multi-Version Concurrency Control), where readers see a consistent snapshot without blocking writers — how Postgres and MySQL/InnoDB avoid read locks.

### Storage Engine (Disk Storage Manager)

Responsible for how data is physically laid out on disk — organizing rows into pages/blocks, managing free space, and translating logical reads/writes ("give me the row with id=5") into actual disk I/O operations.

### Buffer Manager

Since reading from disk is slow (as the I/O math in the next section shows), the buffer manager keeps a pool of disk blocks cached in memory — the "buffer pool" — so repeated reads of the same block don't hit disk again, and batches/delays writes using eviction policies like LRU.

### Index Manager

Maintains the auxiliary data structures (like the B-Tree described below) that let the engine jump straight to relevant rows instead of scanning the whole table. It's also responsible for keeping every index in sync whenever rows are inserted, updated, or deleted.

### OS Interaction Layer

The database doesn't talk to the physical disk directly — it goes through the operating system's file system and I/O APIs. This layer handles that interface: file reads/writes, memory-mapping, and OS-level caching sitting underneath the database's own buffer pool.

### Shard Manager

In a sharded (horizontally partitioned) database, data is split across multiple independent database instances by some key (e.g. a `user_id` range). The shard manager knows which shard holds which piece of data and routes a given query to the right shard(s).

### Cluster Manager

Oversees a group of database nodes working together — tracking which nodes are alive, electing a leader/primary when needed, and handling node failures so the system as a whole keeps running even if one machine goes down.

### Replication Manager

Keeps copies of the same data in sync across multiple nodes — typically one primary that accepts writes and one or more replicas receiving a continuous stream of changes — used for both high availability (failover if the primary dies) and read scaling (serve reads from replicas).

## RAM vs Hard Disk

**Ram:** Temporary (volatile), limited space, expensive

**Hard Disk:** Persistence, cheap, slow

Intersection of disk track and pie gives us file block. each file block is let say 4kb. To process data we have to take the file block and load into the memory like RAM. CPU can process data from memory not from disk directly.

### An example

1 block can store 4kb.

Let say we have to read 1 million records = 10^6.

per entry = 400 bytes

each block can store 4 kb

so how many entry can store a single block = 4000bytes/400 bytes = 10 records

how many blocks is needed to store 1 million records = 10^6/10 = 10^5 blocks. so in total 10^5*4000 = 4*10^8 = 400MB

So a single I/O operation in disk takes 1ms so to read up to 10^5 blocks it will take 10^5 ms = 100 sec to read 1 million records.

Now let say if we can improve this

Consider a list of pointer which is referencing blocks

each pointer is covering let say 10 blocks

| Pointer entry | Block ref |
| ------------- | --------- |
| 1              | 1         |
| 2              | 11        |
| 3              | 21        |

each entry of this table is taking 10 bytes.

so how many blocks can fit into a single pointer?

4000 bytes / 10 =  400 blocks

so how many entries of the pointer is needed to fit entire 10^5 blocks?

10^5 / 400 = 250 blocks.

So now to get the data how much time we need?

250 ms

and we have optimized from 100 secs to 250 ms

and this table calls index.

Now if we do another level indexing of index table. so there are 250 entries and to a new index table if each entry takes 10 bytes there is 25 blocks.

This is called multi level indexing.

### Why B-Trees win for disk-based indexing

For indexing B Tree is winner for read, update and delete for its m way tree. if a tree m children. that means for 100 based log(10^6) there is needed only 3 ms as each operation is taking 1 ms. balanced BST is the next winner.

The reason a B-Tree fits this disk model so well is that each B-Tree node is sized to match a disk block (the same 4kb block from the example above), and each node can hold many children (a high **fan-out**, e.g. 100-way) instead of just 2 like a binary search tree. A higher fan-out means the tree stays very shallow even with millions of records, so finding a row only costs a handful of disk I/Os — exactly the `log_100(10^6) ≈ 3` result above. A balanced BST, being 2-way, would need `log_2(10^6) ≈ 20` comparisons — and since each level in a disk-backed tree can mean a separate I/O, that's roughly 20 disk reads instead of 3. That's the whole reason relational databases default to B-Trees (or B+Trees) for indexes rather than balanced binary search trees.

# SQLite

SQLite is a lightweight embedded serverless db

SQlite library is embeddeble in the same process. O config just need to download the opensource code and use it.

It supports ACID properties

> **ACID** = **A**tomicity (a transaction either fully happens or not at all), **C**onsistency (a transaction can't leave the database in an invalid state), **I**solation (concurrent transactions don't see each other's half-finished work), **D**urability (once committed, data survives a crash). These are the same guarantees the Transaction Management and Recovery Manager components above are responsible for enforcing.

## How SQLite process data

### Tokenizer

giving a kind of key value pair from human readable text like create_table to internal representation

### Parser

Parser is like if a set of tokens has followed a particular grammar rule what action we are going to take. So it builds the tree

### Code generator

This step runs the tree into a list of small, simple instructions called bytecode. it also decides the plan such as "use the index" or "scan the whole table". the ticket looks soemthing like this

```
1. Open the table "users"
2. Put the number 5 in a register
3. Jump to the row with id 5 (if none, finish)
4. Read the "name" column of that row
5. Output it as a result
6. Stop
```

### VDBE

VDBE stands for Virtual Database Engine stands that executes bytecode one instruction at a time like a CPU
