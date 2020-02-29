const express = require('express');
const logger = require('../logger');

const notefulRouter = express.Router();
const bodyParser = express.json();
const FolderService = require('../folder-services');
const NoteService = require('../note-services');
const { getFolderValidationError } = require('./folder-validator');

const serializeFolder = folder => ({
  id: folder.id,
  name: folder.name,
  date_created: folder.date_created
});
const serializeNote = note => ({
  id: note.id,
  date_modified: note.date_modified,
  content: note.content,
  name: note.name,
  folder_id: note.folder_id
});

//ROUTE FOR FOLDERS
notefulRouter
  .route('/folders')
  .get((req, res, next) => {
    FolderService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body;
    const newFolder = { name };
    const error = getFolderValidationError(newFolder);

    for (const field of ['name']) {
      if (!newFolder[field]) {
        logger.error(`${field} is required`);
        return res
          .status(400)
          .send({ error: { message: `${field} is required` } });
      }
    }
    if (error) return res.status(400).send(error);

    FolderService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        logger.info(`Folder with ${folder.id} was created.`);
        res
          .status(201)
          .location(`/api/noteful/${folder.id}`)
          //   .json(serializeFolder(folder))
          .send(folder);
      })
      .catch(next);
  });
//GETS, DELETE, AND UPDATE FOLDER BY ID
notefulRouter
  .route('/folders/:folder_id')
  .all((req, res, next) => {
    const { folder_id } = req.params;
    FolderService.getFolderById(req.app.get('db'), folder_id)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found.`);
          return res.status(404).json({
            error: {
              message: `folder id ${folder_id} not found. Please try again`
            }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const { folder_id } = req.params;
    FolderService.deleteFolder(req.app.get('db'), folder_id)
      .then(numRowsAffected => {
        logger.info(`Folder with id ${folder_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const name = req.body;
    const folderToUpdate = name;
    const error = getFolderValidationError(folderToUpdate);

    if (error) return res.status(400).send(error);

    FolderService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
        logger.info(`Folder with id ${req.params.folder_id} updated.`);
      })
      .catch(next);
  });

//ROUTER FOR NOTES
notefulRouter
  .route('/notes')
  .get((req, res, next) => {
    NoteService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name, content, folder_id } = req.body;
    const newNote = { name, content, folder_id };
    // const error = getFolderValidationError(newFolder);

    for (const field of ['name', 'content', 'folder_id']) {
      if (!newNote[field]) {
        logger.error(`${field} is required`);
        return res
          .status(400)
          .send({ error: { message: `${field} is required` } });
      }
    }
    // if (error) return res.status(400).send(error);

    NoteService.insertNote(req.app.get('db'), newNote)
      .then(note => {
        logger.info(`Note with id ${note.id} was created.`);
        res
          .status(201)
          .location(`/api/noteful/notes/${note.id}`)
          //   .json(serializeFolder(note))
          .send(note);
      })
      .catch(next);
  });
notefulRouter
  .route('/notes/:note_id')
  .all((req, res, next) => {
    const { note_id } = req.params;
    NoteService.getNoteById(req.app.get('db'), note_id)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${note_id} not found.`);
          return res.status(404).json({
            error: {
              message: `Note id ${note_id} not found. Please try again`
            }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const { note_id } = req.params;
    NoteService.deleteNote(req.app.get('db'), note_id)
      .then(numRowsAffected => {
        logger.info(`Note with id ${note_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { name, content } = req.body;
    const noteToUpdate = { name, content };
    // const error = getFolderValidationError(folderToUpdate);

    // if (error) return res.status(400).send(error);
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name' field`
        }
      });
    }

    NoteService.updateNote(req.app.get('db'), req.params.note_id, noteToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
        logger.info(`Note with id ${req.params.note_id} updated.`);
      })
      .catch(next);
  });

module.exports = notefulRouter;
