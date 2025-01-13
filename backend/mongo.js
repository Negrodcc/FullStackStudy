const mongoose = require('mongoose')

if (process.argv.length <3){
    console.log("give password as argument")
    process.exit(1)
}

const password = encodeURIComponent(process.argv[2])


const url = `mongodb+srv://negrodcc:${password}@fullstack.r7yq8.mongodb.net/noteApp?retryWrites=true&w=majority&appName=FullStack`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
  })

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
    content: 'HTML es muy facil',
    important: true,
})

note.save().then(result => {
    console.log('note saved!')
    Note.find({})
        .then(result => {
            result.forEach(note => {
                console.log(note)
            })
        mongoose.connection.close()
    })
  })    