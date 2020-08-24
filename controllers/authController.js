const passport = require('passport'); 
const Usuarios = require('../models/Usuarios'); 
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');

const bcrypt = require('bcrypt-nodejs');

const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/iniciar-sesion', 
    failureFlash: true, 
    badRequestMessage: 'Ambos Campos son obligatorios'
}); 


//fn para revisar si el usuario esta logueado o no 
exports.usuarioAutenticado = (req,res,next) => {
    //si el usuario eta autenticado, adelante
    if(req.isAuthenticated()){
        return next(); 
    }
    //sino, redirigir al formulario
    return res.redirect('/iniciar-sesion');
}


//fn para cerrar sesion
exports.cerrarSesion = (req,res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); //al cerrar sesion nos lleva al login
    })
}


//fn para generar token si usuario es valido
exports.enviarToken = async (req,res) => {



    const {email} = req.body;

    //verificar si usuario existe
    const usuario = await Usuarios.findOne({where: {email}})

    //si no existe
    if(!usuario){ 
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/reestablecer');
    }

    //usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');

    //expiracion
    usuario.expiracion = Date.now() + 3600000;

    //guardar en bd
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`; 

    //envia el correo con el token
    await enviarEmail.enviar({
        usuario, 
        subject: 'Password Reset', 
        resetUrl, 
        archivo: 'reestablecer-password'
    }); 

    //terminar
    req.flash('correcto', 'Se envio un mensaje a tu correo ')
    res.redirect('/iniciar-sesion');
 

}


exports.validarToken = async (req,res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    }); 

    //si no encuentra usuario
    if(!usuario){
        req.flash('error', 'no valido'); 
        res.redirect('/reestablecer');
    }

    //formulario para generar pass
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Contrasena'
    })

    console.log(usuario);
}




//cambiar pass
exports.actualizarPassword = async (req,res) => {

    //verificar el token valido pero tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    }); 

    //verificamos si usuario existe
    if(!usuario){ 
        req.flash('error', 'No validoo'); 
        res.redirect('/reestablecer');
    }

    //hashear nuevoo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null; 
    usuario.expiracion = null;

    //guardar nuevo pass
    await usuario.save();
    req.flash('correcto', 'Tu password se modifico correctamente');
    res.redirect('/iniciar-sesion'); 

}