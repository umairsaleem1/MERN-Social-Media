 const formatName = (name)=>{

    let formatedName = name.split(' ').map((item)=>{
        return item[0].toUpperCase()+item.slice(1)
    }).join(' ')

    return formatedName;
 }

 export default formatName;