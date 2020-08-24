const passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy;


//Referencia al modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

//local strategy - login con credenciales propias (user y pass)
passport.use(
    new LocalStrategy(
        //por default passport espera un usuario y password
        {
            usernameField: 'email', 
            passwordField: 'password'
        },
        async (email, password,done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: {email, 
                    activo: 1}
                })

                //el usuario existe, password incorrecto
                if(!usuario.verificarPassword(password)){
                    return done(null, false, {
                        message: 'Password Incorrecto'
                    })
                }

                //el mail existe y password correcto

                return done(null, usuario); 
            } catch (error) {
                //ese usuario no existe
                return done(null, false,{
                    message: 'La cuenta no existe'
                })
            }
        }
    )
)


//serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
}); 

//desserializar al usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario)
}); 


//exportar

module.exports = passport;