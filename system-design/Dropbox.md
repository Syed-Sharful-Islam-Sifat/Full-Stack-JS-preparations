# Dropbox System Design

Dropbox is a system where user can upload a file can download a file and can share a file.

## Functional Requirements

- User should upload a file
- User should download a file
- User should share a file

## Non Functional Requirements

- I think availability > consistency for a file storage
- System should handle large file as 50GB
- Upload , Download and share should as fast as possible (low latency)

## Define the core entities

- File
- User
- Filemetadata

## API interface

```
POST api/files
{
  file,
  filemetadata
}

GET api/files/[fileId] -> give the file

POST api/files/[fileId]/share
{
    email:"",
    accesibility:""
}

GET api/files/{fileId}/changes?timestamp = {} -> changeevent
```

## High Level Design

### 1. Upload a file to the system

#### Upload file to a single server (Bad solution)

Client will request for uploading a file to the server. server will check the file type and verify the file then it will store the file to the server and if storage needed we will horizontally will scale the store of the server. we can store file metadata to the Database

#### Store file in blob storage (Good solution)

We can upload the file to the blob storage like AWS S3 or Google Cloud storage and also store the metadata to the DB. We can store as much file as possible as AWS S3 or google cloud storage they are optimized as well and reliable and also if our server goes down we will not loose the access of our files and these services can track of versioning of the files so we can know the changes of the file.

**Challenges:** we have to store in two places file in blob storage and metadata in db so we can face a problem where we were able to store the data in blob storage but not in db and vice versa so for these problem we can implement transaction. So the problem is we have to communicate with multiple service for one single operation.

#### Upload the file directly to the blob storage (Great Solution)

The best approach is to allow the user to upload the file on Blob storage directly. User request to a presigned url from a server with filemetadata server sends a presigned url which client can use directly to upload the file. So there are mainly 3 case:

1. We request a presigned url through a POST request along sending file meta data to the body. server takes that metadata and save it to the and db in response it gives a presigned url
2. After getting presigned url use can upload the file directly to the presigned url.
3. On Success S3 will send a notification to our server and server will update the metadata and the status of the file that it has been uploaded.

### 2. User should be able to download a file

#### Download through file server (Bad Solution)

The most common solution could once download file from blob storage to server then downloading it from the server to the client we are downloading twice and thats a waste of bandwidth.

Its a common approach because its more intuitive let say a file needs authentication to download it so developer would think backend will first validate user and download it from blob and then backend will serve the client but still thats a bad idea. Because a File that is 1 GB downloading it two times means 2GB of data has downloaded.

#### Download from Blob Storage

A better approach is to allow the user to download the file from blob storage. But here a problem is user can't download a file from blob storage directly should not because if file is authenticated there should be a secured way to download the file. So user can make a request to the backend for a presigned url. backend will send a presigned url and client will use this presigned url to download the file.

This is better solution and almost a great solution but the problem is a cloud region far from user can be a slow experience. we can solve this problem by using a CDN(content delivery network) to cache the file.

#### Download from CDN

We can use CDN which will cache the file and requesting to download the file CDN will serve the file this way user will get much faster experience and there will be low latency. For security just like with our presigned url we can generate url that user can use to download the file from CDN.

**Challenges:** CDNs are expensive so we have to decide which file to cache and how long it should be we can use cache-control header and also we can use cache invalidation

### 3. Users should able to share a file with other users

#### Embedding share list of users to file metadata

This is a very simple and direct approach. just pushing users to the sharelist array to the metadata. In this appraoch we can get a particular user's file very quickly through indexing but getting files that has been shared with the user we need to scan every file and also the sharelist thats a slow approach

#### Caching to speed up fetching sharelist (Good solution)

Whenever user opens the site once we will fetch which files are belongs to them and maintain a cache which will map user to files that belongs to that particular user like user1:[file1,file2] this way we can give the data very fast

**Challenges:** it will be tough to sync with sharedFiles and sharedList

#### Create a different table or collection for share

This way we can get rid of syncing sharelist and sharedfiles a share table which will take userId and the fileId together they will create a composite primary key allowing a single user to have multiple files

### 4. User can automatically sync files across devices

We need to make sure files are automatically synced. So there are two cases from local to remote and remote to local.

**Local -> remote**

When an user update a file we need to sync this changes to the remote as soon as possible. To do this we need a client side sync agent that will monitor the changes on local machine there are some os specific file monitoring system like File System Watcher or File System Events. it queues the modified file and upload locally. it then uses the upload api to send the changes to the server along with updated metadata. conflicts are resolved with "last write wins"

**Remote -> local**

So Client needs to know if there is any changes happened to the remote server. there are two ways.

1. **Polling**

   This way client continue asks server if there is any changes happened server query to the db and compares the last sync timestamp to db updated timestamp so if the updated timestamp is greater time then client will pull the changes from CDN or cloud

2. **Socket**

   Server maintains a open connection with client so any changes happened client will get notified.
