const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');


exports.formCrearCuenta = (req,res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear cuenta en Uptask'
    })
}


exports.formIniciarSesion = (req,res) => {
    const {error} = res.locals.mensajes; 
    res.render('iniciarSesion', {
        nombrePagina: 'Iniciar Sesion en Uptask', 
        error
    })
}


exports.crearCuenta = async (req,res) => {
    //leer datos
    const {email, password} = req.body;

    try {
        await Usuarios.create({
            email, 
            password
        }); 

        //crear url de confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`; 


        //crear objeto de usuario
        const usuario = {
            email
        }
        //enviar email
        await enviarEmail.enviar({
            usuario, 
            subject: 'Confirma tu cuenta Uptask', 
            confirmarUrl, 
            archivo: 'confirmar-cuenta'
        }); 

        //redirigir al usuario

        req.flash('correcto', 'enviamos un correo, confirma tu cuenta.')

        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina: 'Crear cuenta en Uptask', 
            email, 
            password
        })
    }
    //console.log(req.body);
    //crear usuarios
}

exports.formRestablecerPassword = (req,res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer Contrasena'
    })
}


exports.confirmarCuenta = async (req,res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    //no existe usuario
    if (!usuario){
        req.flash('error', 'no valido'); 
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1; 

    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente'); 
    res.redirect('/iniciar-sesion');
}