const notesRouter = require('express').Router()
const User = require('../models/user')
const Note = require('../models/note') //Class <-> Object Factory
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization') //authorization field in the header
  if (authorization && authorization.startsWith('Bearer ')) { //starts with the key word Bearer
    return authorization.replace('Bearer ', '') //rid the key word
  }
  return null
}

notesRouter.get('/', async (request, response) => { 
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async (request, response) => {
  const body = request.body
  //verify that the Token matches with the SECRET variable, and if the token it's rigth, will have the user's id and
  //and the username
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id //add the userID to the Note
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id) //add the note to the user with concat
  await user.save() //save the data
  
  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  const updateNote = await Note.findByIdAndUpdate(request.params.id, note, { new: true })
  response.json(updatedNote)

})

module.exports = notesRouter