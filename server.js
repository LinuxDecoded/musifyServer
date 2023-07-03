require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const lyricsFinder = require("lyrics-finder")
const SpotifyWebApi = require("spotify-web-api-node")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const spotifyApiOptions = {
  redirectUri: process.env.REDIRECT_URI,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
}

app.post("/refresh", async(req, res) => {
  const refreshToken = req.body.refreshToken
  spotifyApiOptions.refreshToken = refreshToken
  const spotifyApi = new SpotifyWebApi(spotifyApiOptions)

  try {
    const data = await spotifyApi.refreshAccessToken()
    res.json({
      accessToken: data.body.access_token,
      expiresIn: data.body.expires_in,
    })
  } catch (error) {
    console.log(error)
    res.sendStatus(400)
  }
})

app.post("/login", async (req, res) => {
  const code = req.body.code
  const spotifyApi = new SpotifyWebApi(spotifyApiOptions)

  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    res.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    })
  }
  catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

app.post("/lyrics", async (req, res) => {
  const lyrics = await lyricsFinder(req.body.artist, req.body.track) || "No Lyrics Found"
  res.json({ lyrics })
})

app.listen(3001)