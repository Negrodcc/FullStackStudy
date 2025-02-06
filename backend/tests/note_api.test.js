const { test, after, beforeEach} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Note = require('../models/note')
const {initialNotes, nonExistingId, notesInDb} = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})

  for (let note of initialNotes) {
    let noteObject = new Note(note)
    await noteObject.save()
  }
})

//-------------TESTS--------------

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(e => e.content)
  assert(contents.includes('HTML is easy'))
})

test('a valid note can be added', async () => {
  const newNote = {
    content: "async/await simplifies making async calls",
    important: true
  }

  await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

  const notesAtEnd = await notesInDb()
  assert.strictEqual(notesAtEnd.length, initialNotes.length + 1)

  const contents = notesAtEnd.map(n => n.content)
  assert(contents.includes('async/await simplifies making async calls'))
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

    const notesAtEnd = await notesInDb()

    assert.strictEqual(notesAtEnd.length, initialNotes.length)
})

test('a specific note can ve viewed', async () => {
  const notesAtStart = await notesInDb();
  const noteToView = notesAtStart[0];
  
  const response = await api
                  .get(`/api/notes/${noteToView.id}`)
                  .expect(200)
                  .expect('Content-Type', /application\/json/)

  assert.deepStrictEqual(response.body, noteToView)
})

test('a note can be deleted', async () => {
  const notesAtStart = await notesInDb();
  const noteToDelete = notesAtStart[0]

  await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)  
  
  const notesAtEnd = await notesInDb();                      
  assert.strictEqual(notesAtStart.length - 1, notesAtEnd.length)                    

  const contents = notesAtEnd.map(r => r.content)
  assert(!contents.includes(noteToDelete.content))
})

after(async () => {
  await mongoose.connection.close()
})

