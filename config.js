module.exports = {
    mongodb: {
        // uri: 'mongodb://localhost:27017/mafia'
        uri: 'mongodb://admin:admin123@ds161653.mlab.com:61653/mafia'
    },
    secret: 'YOURSUPERDUPERSECRETFORPASSWORDHASHING',
    auth: {
        'googleAuth': {
            'clientID': '361645084533-damvltds52fg1umo5d350766uv16m60m.apps.googleusercontent.com',
            'clientSecret': 'fEPkMl3JsTUBszjdKSwwfSVk',
            'callbackURL': 'http://localhost/auth/google/callback'
        }
    },
    ports: [8000, 443] // ports for http and https
}