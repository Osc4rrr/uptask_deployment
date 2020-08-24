const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');


exports.proyectosHome = async (req,res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}}); 
    res.render('index', {
        nombrePagina: 'Proyectos', 
        proyectos
    });
}

exports.formularioNuevoProyecto = async (req,res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}}); 
    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto', 
        proyectos
    });
}

exports.nuevoProyecto = async (req,res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where:{usuarioId}}); 
    

    //validar que tengamos algo en el input
    const { nombre } = req.body;

    let errores = [];

    if(!nombre){
        errores.push({'texto': 'Agrega un nombre de proyecto'}); 
    }

    //si hay errores
    if(errores.length > 0){ 
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores, 
            proyectos
        })
    }else{

        //no hay errores
        //insertar a bd
        const usuarioId = res.locals.usuario.id;
        const proyecto = await Proyectos.create({nombre, usuarioId});
        
        res.redirect('/');
    }

}

exports.proyectoPorUrl = async(req,res, next) => {

    const usuarioId = res.locals.usuario.id;
    const proyectosPromise =  Proyectos.findAll({where:{usuarioId}}); 

    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url, 
            usuarioId
        }
    })

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //consultar tareas del proyecto actual 
    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        }, 
        include:[
            {model:Proyectos}
        ]
    }); 

    //console.log(tareas);

    if(!proyecto) return next(); 

    res.render('tareas', {
        nombrePagina: 'Tareas del proyecto', 
        proyecto, 
        proyectos, 
        tareas
    })
}


exports.formularioEditar = async(req,res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectosPromise =  Proyectos.findAll({where:{usuarioId}}); 

    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id, 
            usuarioId
        }
    })

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    res.render('nuevoProyecto', {
        nombrePagina: 'Editar Proyecto', 
        proyectos, 
        proyecto
    })
}

exports.actualizarProyecto = async(req,res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos =  Proyectos.findAll({where:{usuarioId}}); 

    const nombre = req.body.nombre; 

    let errores = []; 

    if(!nombre){
        errores.push({'texto': 'Agrega un nombre al proyecto'}); 
    }


    if(errores.length > 0){ 
        res.render('nuevoProyecto', 
            errores,
            proyectos
        )
    }else{

        await Proyectos.update(
            {nombre:nombre}, 
            {where: {id: req.params.id}}
        ); 

        res.redirect('/')

    }
}


exports.eliminarProyecto = async(req,res, next)=>{

    //req, query, params

    const { urlProyecto} = req.query; 

    const resultado = await Proyectos.destroy({where: {url: urlProyecto}}); 

    if(!resultado){
        return next(); 
    }

    res.status(200).send('Proyecto Eliminado Correctamene');

}