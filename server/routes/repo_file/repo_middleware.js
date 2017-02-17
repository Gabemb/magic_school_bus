const fs = require('fs-extra');
const path = require('path');
const mkdirp = require('mkdirp');
const models = require('../../db/models');
const sequelize = models.sequelize;
const Lesson = models.lesson;

class SocketConnection {
  constructor(io) {
    this.io = io;
    this.pathMaker = this.pathMaker.bind(this);
    this.addNodeToTree = this.addNodeToTree.bind(this);
    this.rawData = this.rawData.bind(this);
    this.addDir = this.addDir.bind(this);
    this.addFile = this.addFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.deleteDir = this.deleteDir.bind(this);
    this.getFile = this.getFile.bind(this);
    this.updateFile = this.updatFile.bind(this);
  }

  /**
   * creates a path to repo on server based on useresLocalPath
   * @param { String } directoryBeingWatched
   * @param { String } usersLocalPath
   * @return { object } pathToRepoStorage, subPath, fileDirectory
   * subPath = path after 'repo/' directory
   * fileDirectory = { arr } full file directory
   */
  pathMaker(directoryBeingWatched, usersLocalPath, className, lessonName) {
    let subPath = usersLocalPath.split('/');
    // remove everything prior to the ${repoPath} in localPath
    const repoPathLocationStart = subPath.indexOf(directoryBeingWatched);
    const fileDirectory = subPath.slice(repoPathLocationStart + 1);
    subPath = subPath.slice(repoPathLocationStart + 1).join('/');

    // join path based on servers location pointing to repo fodler
    const pathToRepoStorage = path.join(__dirname, `../../../repo/${className}/${lessonName}`, subPath);
    return { pathToRepoStorage, subPath, fileDirectory };
  }

  /**
  * add to the nested tree structure using firstChildNode since its pass by
  * refrence there is no need to save this functions return into a variable
  * @param {Array} firstChildNode
  * @param {Array} splitFileDirectory
  * @param {String} subPath
  * @returns {firstNestedNode}
  */
  addNodeToTree(firstChildNode, splitFileDirectory, subPath) {
    if (splitFileDirectory.length === 1) {
      firstChildNode.push({ title: splitFileDirectory[0], path: subPath });
      return firstChildNode;
    } else {
      for (let i = 0; i < firstChildNode.length; i += 1) {
        if (firstChildNode[i].title === splitFileDirectory[0]) {
          return this.addNodeToTree(firstChildNode[i].childNodes, splitFileDirectory.slice(1), subPath);
        }
      }
      const splitFileDirectorycopy = splitFileDirectory.slice(1);
      const node = this.addNodeToTree([], splitFileDirectorycopy, subPath);
      firstChildNode.push({ title: splitFileDirectory[0], childNodes: node });
      return firstChildNode;
    }
  }

  // api/repoFile/updateFile
  // ~ this is to add file into web repo file directory that already exist (rawData of chokidari)
  rawData(req, res) {
    // repoPath = directory being watched
    // localPath = full local path change was made on
    // data = inner file text
    const { repoPath, localPath, data, className, lessonName } = req.body;
    const { pathToRepoStorage, subPath } = this.pathMaker(repoPath, localPath, className, lessonName);
    fs.outputFile(pathToRepoStorage, data, (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        // send subPath and data because the file was updated
        this.io.sockets.emit('updated-file', { subPath, data });
        res.sendStatus(200);
      }
    });
  }

  // api/repo_file/addDir
  // ~ this is to create directory in webs repo file directory (addDir of chokidari)
  addDir(req, res) {
    // repoPath = directory being watched
    // localPath = full local path change was made on
    const { repoPath, localPath, className, lessonName } = req.body;
    const { pathToRepoStorage } = this.pathMaker(repoPath, localPath, className, lessonName);
    mkdirp(pathToRepoStorage, (err) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  }

  // api/repoFile/addFile
  // ~ this is to create a file in webs repo file directory (addDir of chokidari)
  addFile(req, res) {
    // repoPath = directory being watched
    // localPath = full local path change was made on
    const { repoPath, localPath, data, className, lessonName, lessonId } = req.body;
    const { pathToRepoStorage, subPath, fileDirectory } = this.pathMaker(repoPath, localPath, className, lessonName);
    let repo = null;
    let t1 = sequelize.transaction();
    Lesson.findById(lessonId)
    .then((lesson) => {
      repo = lesson.get('repo');
      this.addNodeToTree(repo, fileDirectory, subPath);
      return Lesson.update({ repo },
        {
          where: {
            id: 1,
          },
          transaction: t1,
          lock: {
            level: t1.LOCK.UPDATE,
            of: Lesson,
          }
        });
    })
    .then((updated) => {
      if (updated) {
        fs.outputFile(pathToRepoStorage, data, (err) => {
          if (err) {
            res.sendStatus(500);
          } else {
            // send repo object
            this.io.sockets.emit('updated-directory', repo);
            res.sendStatus(200);
          }
        });
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      res.sendStatus(500);
    });
  }

  // api/repoFile/addFile
  // ~ this is to delete a file in webs repo file directory (addDir of chokidari)
  deleteFile(req, res) {
    // repoPath = directory being watched
    // localPath = full local path change was made on
    const { repoPath, localPath, className, lessonName, lessonId } = req.body;
    const { pathToRepoStorage, fileName } = this.pathMaker(repoPath, localPath, className, lessonName);
    let repo = null;
    Lesson.findById(lessonId)
    .then((lesson) => {
      repo = lesson.get('repo');
      delete repo[fileName];
      return Lesson.update({ repo },
        {
          where: {
            id: 1,
          },
        });
    })
    .then((updated) => {
      // this if ensures you never erase the root direcroty
      if (updated && pathToRepoStorage.length > 28) {
        fs.remove(pathToRepoStorage, (err) => {
          if (err) {
            res.sendStatus(500);
          } else {
            // send repo object
            this.io.sockets.emit('updated-directory', repo);
            res.sendStatus(200);
          }
        });
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      res.sendStatus(500);
    });
  }

  // api/repoFile/addDir
  // ~ this is to delete a directory in webs repo file directory (remove of chokidari)
  deleteDir(req, res) {
    // repoPath = directory being watched
    // localPath = full local path change was made on
    const { repoPath, localPath, className, lessonName } = req.body;
    const { pathToRepoStorage } = this.pathMaker(repoPath, localPath, className, lessonName);
    // this is to ensures you never erase the root direcroty
    if (pathToRepoStorage.length > 28) {
      fs.remove(pathToRepoStorage, (err) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    }
  }

  // api/repoFile/getFile
  // ~ this is to get a file in webs repo file directory
  getFile(req, res) {
    console.log('==================', req.query);
    const { subPath, className, lessonName } = req.query;
    const pathToRepoStorage = path.join(__dirname, `../../../repo/${className}/${lessonName}`, subPath);
    fs.readFile(pathToRepoStorage, 'utf8', (err, data) => {
      console.log("++++++++++++++++++++++++++++++",pathToRepoStorage)
      if (err) {
        console.log(err)
        res.sendStatus(500).send(err);
      } else {
        res.send(data);
      }
    });
  }

  // api/repoFile/getFile
  // ~ this is to update lessons file watched column (ready on chokidar)
  updatFile(req, res) {
    const { localPath, lessonId } = req.body;
    Lesson.update({ fileWatched: localPath },
      {
        where: {
          id: lessonId,
        },
      })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.sendStatus(500);
      }
    });
  }
}

module.exports = SocketConnection;

