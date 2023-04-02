import express from 'express'
import upload from 'express-fileupload'
import * as IPFS from 'ipfs-core'

const app = express()

app.use(express.json());
app.use(upload())

const gateway = 'https://ipfs.io/ipfs/'
const ipfs = await IPFS.create()

// Endpoint for uploading files
app.post('/files', async (req, res) => {
    // Get the file buffer from the request
    console.log(req.files);
    const buffer = req.files.file.data
  
    // Add the file to IPFS
    const result = await ipfs.add(buffer)
    console.log(result);
  
    // Return the IPFS gateway URL for the file
    res.send({"path":result.path,"gateway":gateway})
  })
  
  // Endpoint for retrieving IPFS file download link
  app.get('/download/:hash', async (req, res) => {
    try {
      // Get the hash value from the request parameters
      const hash = req.params.hash
      console.log(hash)
      // Retrieve the file from IPFS using the hash value
      const stream = await ipfs.cat(hash)
  
      // Convert the file stream to a buffer
      const chunks = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)
  
      // Set the response headers to send the file as a download attachment
      const filename = `${hash}.txt` // Change the file extension to match the actual file type
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  
      // Write the buffer data to the response
      res.write(buffer)
      res.end()
    } catch (err) {
      console.error(err)
      res.status(500).send('Error retrieving IPFS file')
    }
  })
  
app.listen(3002, () => {
  console.log('Server listening on port 3002')
})
