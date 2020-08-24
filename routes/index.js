const express = require('express'); 
const router = express.Router(); 

//importar express validator
const {body} = require('express-validator/check');

//importar controlador
const proyectosController = require('../controllers/proyectosController');
const tareasController = require('../controllers/tareasController');
const usuarioController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const Usuarios = require('../models/Usuarios');


module.exports = function(){
    
    router.get('/', 
        authController.usuarioAutenticado,
        proyectosController.proyectosHome
    );

    router.get('/nuevo-proyecto', 
        authController.usuarioAutenticado,
        proyectosController.formularioNuevoProyecto
    ); 

    router.post('/nuevo-proyecto', 
        authController.usuarioAutenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.nuevoProyecto
    );

    //Listar proyecto
    router.get('/proyectos/:url', 
        authController.usuarioAutenticado,
        proyectosController.proyectoPorUrl
    );

    //actualizar nombre proyecto
    router.get('/proyecto/editar/:id', 
        authController.usuarioAutenticado,
        proyectosController.formularioEditar
    );

    router.post('/nuevo-proyecto/:id', 
        authController.usuarioAutenticado,
        body('nombre').not().isEmpty().trim().escape(), 
        proyectosController.actualizarProyecto
    ); 


    //eliminar proyecto
    router.delete('/proyectos/:url',
        authController.usuarioAutenticado,
        proyectosController.eliminarProyecto);

    //Tareas
    router.post('/proyectos/:url', 
        authController.usuarioAutenticado,
        tareasController.agregarTarea
    ); 

    //actualizar tarea
    router.patch('/tareas/:id',
        authController.usuarioAutenticado,
        tareasController.cambiarEstadoTarea
    );

    //eliminar tarea
    router.delete('/tareas/:id', 
        authController.usuarioAutenticado,
        tareasController.eliminarTarea
    );

    //crear nueva cuenta
    router.get('/crear-cuenta', usuarioController.formCrearCuenta);
    router.post('/crear-cuenta', usuarioController.crearCuenta); 
    router.get('/confirmar/:correo', usuarioController.confirmarCuenta);

    // iniciar sesion
    router.get('/iniciar-sesion', usuarioController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //cerrar sesion
    router.get('/cerrar-sesion', authController.cerrarSesion); 


    //reestablecer pass
    router.get('/reestablecer', usuarioController.formRestablecerPassword); 
    router.post('/reestablecer', authController.enviarToken); 
    router.get('/reestablecer/:token',authController.validarToken); 
    router.post('/reestablecer/:token', authController.actualizarPassword); 

    return router; 
}