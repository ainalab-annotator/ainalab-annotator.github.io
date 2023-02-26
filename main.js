var localTheme;
var flag_for_select;
if(localStorage.getItem('theme')=='Тёмная') {
    flag_for_select = true;
    localTheme = 'dark';
    document.getElementById('body').classList.remove('lightBody');
    document.getElementById('body').classList.add('darkBody');
}else{
    localTheme = 'light';
    document.getElementById('body').classList.remove('darkBody');
    document.getElementById('body').classList.add('lightBody');
}


// Функция генерации HTML элементов
function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

var controls = Object.create(null);
var image = document.createElement("img");
var ratio;
var infobar;
var secretcx;
var secretcx2;
var secretcx3;
var cx2;
var shearscx;
var shearscx2;
var shearscx3;
var cx3;

var global_size = 5;
var cursor = elt('div', {id:'id_cursor'});

var allfiles, text_upload_file1, text_upload_file2;
// Все элементы родителя body
function createPaint(parent) {

    cursor = elt('div', {id:'id_cursor', width:'20px', height:'20px'})
    // Создание канваса (Canvas)

    var canvas3 = elt("canvas", {id: 'id_canvas3', width: 0, height: 0, style: 'display:none;'})
    cx3 = canvas3.getContext("2d") 

    var canvas = elt("canvas", {id: 'id_canvas', width: 0, height: 0});
    var cx = canvas.getContext("2d");

    var canvas2 = elt("canvas", {id: 'id_canvas2', width: 0, height: 0});
    cx2 = canvas2.getContext("2d");

    var secretcanvas = elt('canvas', {id: 'id_secretcanvas', width:0, height:0})
    secretcx = secretcanvas.getContext("2d");

    var secretcanvas2 = elt('canvas', {id: 'id_secretcanvas2', width:0, height:0})
    secretcx2 = secretcanvas2.getContext("2d");

    var secretcanvas3 = elt('canvas', {id: 'id_secretcanvas3', width:0, height:0})
    secretcx3 = secretcanvas3.getContext("2d");

    var shearscanvas = elt('canvas', {id: 'id_shearscanvas', width:0, height:0})
    shearscx = shearscanvas.getContext("2d")

    var shearscanvas2 = elt('canvas', {id: 'id_shearscanvas2', width:0, height:0})
    shearscx2 = shearscanvas2.getContext("2d")

    var shearscanvas3 = elt('canvas', {id: 'id_shearscanvas3', width:0, height:0})
    shearscx3 = shearscanvas3.getContext("2d")
    // Блок хранения инструментов и других кнопок (Toolbar)
    var toolbar = elt("div", {class: `toolbar ${localTheme}ToolFileFooterbar`, id:'id_toolbar'});
    // добавление элементов описанных ниже
    for (var name in controls) toolbar.appendChild(controls[name](cx));

    // Блок хранения загруженных файлов (Filebar)
    text_upload_file1 = elt("p", {id: 'id_text_upload_file1', style:'font-family: Arial; font-size:14px; text-align: center;color:white'}, "ЗАГРУЗИТЕ ФАЙЛ");
    text_upload_file2 = elt("p", {id: 'id_text_upload_file2', style:'font-family: Arial; font-size:14px; text-align: center;color:white'}, "ФОТО: PNG, JPG");
    allfiles = elt("div", {class: `${localTheme}ToolFileFooterbar`, id: "id_allfiles"}, text_upload_file1, text_upload_file2);
    infobar = elt("div", {class: `${localTheme}ToolFileFooterbar`, id: "id_infobar"});
    var buttonUP = elt("button", {href: '#', onClick:'upphoto()', class:`btn ${localTheme}btn btn_updownrem`, id:'id_buttonUP'}, "↑");
    var buttonDOWN = elt("button", {href: '#', onClick:'downphoto()', class:`btn ${localTheme}btn btn_updownrem`, id:'id_buttonDOWN'}, "↓");
    var buttonREM = elt("button", {href: '#', onClick:'remphoto()', class:`btn ${localTheme}btn btn_updownrem`, id:'id_buttonREM'}, "×")
    var filebar = elt("div", {class: `filebar ${localTheme}ToolFileFooterbar`, id: 'id_filebar'}, allfiles,buttonUP, buttonDOWN, buttonREM, infobar);

    // Объединение Filebar и Canvas
    var panel = elt("div", {class: "filebar_and_canvas"}, filebar, canvas2, canvas, secretcanvas, secretcanvas2, secretcanvas3, shearscanvas, shearscanvas2, shearscanvas3, cursor);

    // (Footer)
    // var text_footer = elt('div',{id:'id_text_footer'}, '© Aina 2023');
    // var footer = elt('div', {class: `footer ${localTheme}ToolFileFooterbar`, id:'id_footer'}, text_footer);

    parent.appendChild(elt("div", null, toolbar, panel)); // Запуск

    cursor.id = 'id_cursor';
    cursor.style.cursor = 'none';
    cursor.style.display = 'none';
    cursor.style.borderRadius = '50%';
    cursor.style.border = '5px dotted black';
    cursor.style.width = '5px';
    cursor.style.height = '5px';
    cursor.style.position = 'fixed';
    cursor.style.zIndex = '9999999';
    cursor.style.pointerEvents = 'none';
    cx.canvas.addEventListener('mousemove', (event) => {
      
      let rgb;
      let getI = cx.getImageData(event.offsetX, event.offsetY, 1,1).data;
      let getI2 = cx2.getImageData(event.offsetX, event.offsetY, 1,1).data;
      if(getI[0] == 0 && getI[1] == 0 && getI[2] == 0 && getI[3] == 0){
        rgb = cx2.getImageData(event.offsetX, event.offsetY ,1,1).data
      }else{
        rgb = cx.getImageData(event.offsetX, event.offsetY ,1,1).data
      }
      for(i in dict){
        if((Math.abs(rgb[0] - dict[i][0]) <= 5) && (Math.abs(rgb[1] - dict[i][1]) <= 5) && (Math.abs(rgb[2] - dict[i][2]) <= 5)){
          document.getElementById('id_number_part').textContent = `Деталь: ${i}`
          break;
        }
      }



          if(getI[0] == 0 && getI[1] == 0 && getI[2] == 0 && getI[3] == 0){
            rgb = [getI2[0], getI2[1], getI2[2]]
          }else{
            rgb = [getI[0], getI[1], getI[2]]
          }



      cursor.style.display = 'block';
      cursor.style.border = `5px dotted white`;
      cursor.style.width =global_size + 'px';
      cursor.style.height = global_size + 'px';
      cursor.style.left = event.clientX -Math.round(global_size/2) -3+ 'px';
      cursor.style.top = event.clientY- Math.round(global_size/2) -3 + 'px';
      cx.canvas.addEventListener('mouseout', ()=>{
        cx.canvas.onmousemove = null;
        cursor.style.display = 'none';
      })
    })
}

function upphoto(){
  if(nowFile!=0){
    filebartocanvas(fileArray[nowFile-1][0])
  }
}
function downphoto(){
  if(nowFile!=countFile-1){
    filebartocanvas(fileArray[nowFile+1][0])
  }
}


// Открытие файлов лейблом в виде кнопки
var fileArray = []; // Массив хранение информации о файлах (на момент v3.3 имеет вид -> [['name1.png', cx, url], ['name2.png', cx, url], ...])
var countFile = 0; // Количество файлов в Filebar
var flag_for_remove_text = true; // флаг используется для удаления надписи "UPLOAD FILE" в Filebar



var color_a = 'black';
controls.openFile = function(cx) {

  var input = elt("input", {type:"file", class:`btn ${localTheme}btn`, id:'file-upload', multiple:"",accept:"image/png, image/jpeg"});
  input.addEventListener("change", function() {
    
    // Удаление надписи
    if(flag_for_remove_text && countFile == 0){
    document.getElementById("id_text_upload_file1").remove();
    document.getElementById("id_text_upload_file2").remove();
    flag_for_remove_text = false;
    }

    // Заполняем массив (вид - [['name1.png', cx, url, [command]], ['name2.png', cx, url, [command]], ...])
    if(input.files.length == 0) return;
    for(let i=0;i<input.files.length;i++){
        fileArray.push([input.files[i].name,cx, input.files[i],[]]);

        // Создаем для каждого фото свою кнопку для отображения на Filebar
        var a = document.createElement('button');
        a.setAttribute('href','#');
        a.setAttribute('onClick','filebartocanvas("' + `${String(input.files[i].name)}` + '")'); // При нажатии на кнопку включается функция, в которую передаём название файла 
        a.setAttribute('id',`id_filebar_a${countFile+i+1}`)
        if(localStorage.getItem('theme') == 'Светлая'){
            a.setAttribute('class', 'btn_a lightbtn_a');
        }else{
          a.setAttribute('class', 'btn_a darkbtn_a');
        }
        a.textContent = String("["+String(i+1)+"] " + input.files[i].name);
        var filebarA = document.querySelector('#id_allfiles');
        filebarA.appendChild(a);
        
        if(localStorage.getItem('theme') == 'Светлая'){
        document.getElementById('id_filebar').style = 'color-scheme: light;';


        }else{
        document.getElementById('id_filebar').style = 'color-scheme: dark;';
    }
    }
    countFile = fileArray.length; // обнавляем информацию о количестве файлов
    filebartocanvas(fileArray[0][0])
    checkorder()
    flag_for_remove_text = true;
  });
  return elt("label", {for:"file-upload", class:`custom-file-upload ${localTheme}btn`, id:"id_file-upload"}, "Открыть" , input);
};


// Логотип
controls.aina = function(cx){
    AINA = elt('span', {id:'id_aina'},'AINA.lab');
    return AINA;
  }

// Инструменты (Кисть, Ластик)
var tools = Object.create(null);
controls.tool = function(cx) {
  var select = elt("select", {class: `btn ${localTheme}btn`,id: "id_tool"});
  for (var name in tools){
    if(name == 'Line')
      select.appendChild(elt("option", null, 'Линия'));
    else{select.appendChild(elt("option", null, 'Ластик'));}
  }
  
  cx.canvas.addEventListener("mousedown", function(event) {
    document.getElementById("id_tool").blur();
    document.getElementById("id_tool").blur();
    if(!flag_for_shears && !flag_for_pipe){
      if (event.which == 1) {
        if(select.value == 'Линия'){
          tools["Line"](event, cx);}
        else{
          tools["Erase"](event, cx);
        }
        event.preventDefault();
      }
    }
  });
  select.onfocus = () => {document.getElementById("id_tool").blur();}
  return select;
};

// Вспомагательные функции для реализации инструментов

// Определение курсора
function relativePos(event, element) {
  var rect = element.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}

function trackDrag(onMove, onEnd) {
  function end(event) {
    removeEventListener("mousemove", onMove);
    removeEventListener("mouseup", end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener("mousemove", onMove);
  addEventListener("mouseup", end);
}


// Кисть
tools.Line = function(event, cx, onEnd) {
  cx.lineCap = "round";
  cx.shadowOffsetX = 0
  cx.shadowOffsetY = 0
  cx.shadowBlur = 0
  var pos = relativePos(event, cx.canvas);
  fileArray[nowFile][3].push(['Line', cx.lineWidth, cx.strokeStyle,[]])
  cx.beginPath();
  cx.moveTo(pos.x, pos.y);
  fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
  pos = relativePos(event, cx.canvas);
  fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])

  cx.lineTo(pos.x, pos.y);
  cx.stroke();

  fileArray[nowFile][3].push(['Line', cx.lineWidth, cx.strokeStyle, []])
  trackDrag(function(event) {
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
    fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
  }, onEnd);
};


// Ластик
tools.Erase = function(event, cx) {
  cx.globalCompositeOperation = "destination-out";
  onEnd = function(){cx.globalCompositeOperation = "source-over";}
  cx.lineCap = "round";
  cx.shadowOffsetX = 0
  cx.shadowOffsetY = 0
  cx.shadowBlur = 0
  var pos = relativePos(event, cx.canvas);
  fileArray[nowFile][3].push(['Erase', cx.lineWidth, cx.strokeStyle,[]])
  cx.beginPath();
  cx.moveTo(pos.x, pos.y);
  fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
  pos = relativePos(event, cx.canvas);
  fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])

  cx.lineTo(pos.x, pos.y);
  cx.stroke();

  fileArray[nowFile][3].push(['Erase', cx.lineWidth, cx.strokeStyle, []])
  trackDrag(function(event) {
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
    fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
  }, onEnd);
};


// Размер кисти
controls.brushSize = function(cx) {
  var select = elt("select", {class: `btn ${localTheme}btn`, id: "id_size"});
  var sizes = [5, 8, 12, 25, 35, 50, 75, 100];
  sizes.forEach(function(size) {
    select.appendChild(elt("option", {value: size},
                           size + " px"));
  });
  select.addEventListener("change", function() {
    cx.lineWidth = select.value;
    global_size = select.value;
    document.getElementById("id_size").blur();
  });
  return select;
};

// Цвет кисти
var global_color;
var flag_for_pipe = false;
controls.pipe = function(cx) {
  let i = elt("i", {class:"fa fa-eyedropper"})
  var input = elt("button", {class: `btn ${localTheme}btn`, id:'id_pipe'},i);
  input.addEventListener("click", function() {
    if(countFile!=0){
      if(flag_for_pipe){ 
        document.getElementById('id_pipe').style = "color: white;"
        document.getElementById('id_pipe').style.removeProperty('color');
        flag_for_pipe = false;}
      else{
        flag_for_pipe = true;
        document.getElementById('id_pipe').style = "color: grey;"
        cx.canvas.onmousedown = (event) => {
          let rgb;
          let getI = cx.getImageData(event.offsetX, event.offsetY, 5,5).data;
          let getI2 = cx2.getImageData(event.offsetX, event.offsetY, 5,5).data;
          if(getI[0] == 0 && getI[1] == 0 && getI[2] == 0 && getI[3] == 0){
            rgb = [getI2[0], getI2[1], getI2[2]]
          }else{
            rgb = [getI[0], getI[1], getI[2]]
          }
          cx.canvas.onmousedown = null;
          flag_for_pipe = false;
          for(i in dict){
            if((Math.abs(rgb[0] - dict[i][0]) <= 5) && (Math.abs(rgb[1] - dict[i][1]) <= 5) && (Math.abs(rgb[2] - dict[i][2]) <= 5)){
    
              cx.fillStyle = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;
              cx.strokeStyle = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;

              global_color = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;
              document.getElementById('id_color').value = i;
              break;
            }
          }
          document.getElementById('id_pipe').style = "color: white;"
          document.getElementById('id_pipe').style.removeProperty('color');
        }
      }
    }
  });
  return input;
};

var dict = {"1":[0,0,0],
    "2": [0, 255, 0],
  "3": [0, 0, 255],
  "4": [255, 0, 0],
  "5": [1, 255, 254],
  "6": [255, 166, 254],
  "7": [255, 219, 102],
  "8": [67, 0, 44],
  "9": [1, 0, 103],
  "10": [229, 111, 254],
  "11": [0, 125, 181],
  "13": [255, 0, 246],
  "14": [255, 238, 232],
  "15": [119, 77, 0],
  "17": [144, 251, 146],
  "18": [0, 118, 255],
  "19": [213, 255, 0],
  "21": [255, 147, 126],
  "23": [106, 130, 108],
  "26": [255, 2, 157],
  "27": [254, 137, 0],
  "28": [122, 71, 130],
  "29": [126, 45, 210],
  "30": [133, 169, 0],
  "31": [255, 0, 86],
  "32": [164, 36, 0],
  "33": [120, 130, 49],
  "35": [104, 61, 59],
  "36": [189, 198, 255],
  "37": [38, 52, 0],
  "39": [1, 208, 255],
  "41": [0, 185, 23],
  "42": [158, 0, 142],
  "44": [0, 21, 68],
  "47": [194, 140, 159],
  "49": [255, 116, 163],
  "50": [189, 211, 147],
  "52": [0, 71, 84],
  "56": [149, 0, 58],
  "58": [0, 174, 126],
  "59": [14, 76, 161],
  "60": [145, 208, 203],
  "61": [190, 153, 112],
  "62": [150, 138, 232],
  "63": [187, 136, 0],
  "64": [0, 100, 1],
  "65": [222, 255, 116],
  "66": [0, 255, 198],
  "67": [255, 229, 2],
  "68": [98, 14, 0],
  "69": [0, 143, 156],
  "70": [152, 255, 82],
  "71": [117, 68, 177],
  "72": [181, 0, 255],
  "75": [0, 255, 120],
  "76": [255, 110, 65],
  "77": [0, 95, 57],
  "78": [107, 104, 130],
  "79": [95, 173, 78],
  "80": [167, 87, 64],
  "81": [165, 255, 210],
  "82": [240, 63, 0],
  "83": [0, 103, 53],
  "84": [225, 38, 131],
  "85": [224, 184, 100],
  "86": [246, 60, 100],
  "87": [175, 159, 147],
  "88": [255, 255, 41],
  "89": [246, 215, 0],
  "90": [255, 0, 0],
  "91": [103, 46, 37],
  "92": [19, 128, 69],
  "93": [231, 60, 69],
  "94": [100, 44, 184],
  "95": [246, 221, 75],
  "96": [231, 22, 94],
  "97": [254, 224, 209],
  "98": [78, 66, 25],
  "99": [190, 156, 69],
  "100": [221, 215, 218],
  "101": [69, 106, 7],
  "102": [250, 210, 0],
  "103": [250, 5, 5],
  "104": [145, 145, 230],
  "105": [125, 170, 10],
  "106": [229, 162, 165],
  "107": [125, 50, 255],
  "108": [160, 5, 140],
  "109": [40, 50, 5]};


const dict2 = {}

Object.entries(dict).forEach(([key, value]) => {
  dict2[value] = key
})

controls.color = function(cx) {
  var select = elt("select", {class: `btn ${localTheme}btn`, id:'id_color'});

  for(let i in dict){
    select.appendChild(elt("option", {value: i, style:`background: rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]});`}, i));
  }

  select.addEventListener("change", function() {
    cx.fillStyle = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;
    cx.strokeStyle = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;

    global_color = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;
    document.getElementById("id_color").blur();
  });
  return select;
};

var x1,x2,y1,y2;
var flag_for_shears = false;
controls.shears = function(cx){
  let i = elt('i',{class:"fa fa-cut"})
    var input = elt("button", {class: `btn ${localTheme}btn`, id:'id_shears'},i);
    function shears(){


      if(countFile != 0){
        var color = cx.fillStyle, size = cx.lineWidth;
        if(flag_for_shears){
          shearscx.canvas.width = 0;
          shearscx.canvas.height = 0;
          flag_for_shears = false;
          document.getElementById('id_shears').style = "color: white;"
          document.getElementById('id_shears').style.removeProperty('color');
        }
        else{
          document.getElementById('id_shears').style = "color: grey;"

          flag_for_shears = true;
          shearscx.canvas.width = cx.canvas.width;
          shearscx.canvas.height = cx.canvas.height;
          shearscx.canvas.onmousedown = (event) => {
            x1 = event.offsetX;
            y1 = event.offsetY;
            shearscx.canvas.onmousemove = (event) =>{
              shearscx.clearRect(0,0,cx.canvas.width, cx.canvas.height)

              shearscx.beginPath()
              shearscx.moveTo(x1,y1);
              shearscx.lineTo(event.offsetX, y1)
              shearscx.stroke()
              shearscx.closePath();

              shearscx.beginPath()
              shearscx.moveTo(x1,y1);
              shearscx.lineTo(x1, event.offsetY)
              shearscx.stroke()
              shearscx.closePath();

              
              shearscx.beginPath()
              shearscx.moveTo(x1, event.offsetY);
              shearscx.lineTo(event.offsetX, event.offsetY)
              shearscx.stroke()
              shearscx.closePath();

              shearscx.beginPath()
              shearscx.moveTo(event.offsetX, y1);
              shearscx.lineTo(event.offsetX, event.offsetY)
              shearscx.stroke()
              shearscx.closePath();
            }
            shearscx.canvas.onmouseup = (event) => {
              shearscx.canvas.onmousemove = null;
              x2 = event.offsetX;
              y2 = event.offsetY;
              if(x1 == x2 && y1 ==y2){
                shearscx.canvas.width = 0;
                shearscx.canvas.height = 0;
                flag_for_shears = false;
                return
              }
              shearscx.lineTo(x2,y2);
              shearscx.stroke();


  
  
              let shearsWidth = Math.abs(x2-x1);
              let shearsHeight = Math.abs(y2-y1);
              
              x1 = Math.min(x1,x2);
              y1 = Math.min(y1,y2);
  
              shearscx2.canvas.width = shearsWidth;
              shearscx2.canvas.height = shearsHeight;
  
              shearscx3.canvas.width = shearsWidth;
              shearscx3.canvas.height = shearsHeight;
              
              shearscx2.drawImage(cx2.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);
              shearscx3.drawImage(cx.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);
  
              cx2.canvas.width = shearsWidth;
              cx2.canvas.height = shearsHeight;
  
              cx.canvas.width = shearsWidth;
              cx.canvas.height = shearsHeight;
  
              cx2.drawImage(shearscx2.canvas, 0,0,shearsWidth, shearsHeight)
              cx.drawImage(shearscx3.canvas, 0,0,shearsWidth, shearsHeight)
  
              cx.fillStyle = color;
              cx.strokeStyle = color;
              cx.lineWidth = size;
  
              shearscx.canvas.width = 0;
              shearscx.canvas.height = 0;
  
              shearscx2.canvas.width = 0;
              shearscx2.canvas.height = 0;
  
              shearscx3.canvas.width = 0;
              shearscx3.canvas.height = 0;
  
              fileArray[nowFile][3].push(['Shears', x1, y1, shearsWidth, shearsHeight, color, size])

              flag_for_shears = false;
              document.getElementById('id_shears').style = "color: white;"
              document.getElementById('id_shears').style.removeProperty('color');
            }
            shearscx.canvas.onmousedown = (event) => {

              shearscx.canvas.onmousemove = null;
              x2 = event.offsetX;
              y2 = event.offsetY;
              shearscx.lineTo(x2,y2);
              shearscx.stroke();

              if(x1 == x2 && y1 ==y2){
                shearscx.canvas.width = 0;
                shearscx.canvas.height = 0;
                flag_for_shears = false;
                return
              }
  
  
              let shearsWidth = Math.abs(x2-x1);
              let shearsHeight = Math.abs(y2-y1);
              
              x1 = Math.min(x1,x2);
              y1 = Math.min(y1,y2);
  
              shearscx2.canvas.width = shearsWidth;
              shearscx2.canvas.height = shearsHeight;
  
              shearscx3.canvas.width = shearsWidth;
              shearscx3.canvas.height = shearsHeight;
              
              shearscx2.drawImage(cx2.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);
              shearscx3.drawImage(cx.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);
  
              cx2.canvas.width = shearsWidth;
              cx2.canvas.height = shearsHeight;
  
              cx.canvas.width = shearsWidth;
              cx.canvas.height = shearsHeight;
  
              cx2.drawImage(shearscx2.canvas, 0,0,shearsWidth, shearsHeight)
              cx.drawImage(shearscx3.canvas, 0,0,shearsWidth, shearsHeight)
  
              cx.fillStyle = color;
              cx.strokeStyle = color;
              cx.lineWidth = size;
  
              shearscx.canvas.width = 0;
              shearscx.canvas.height = 0;
  
              shearscx2.canvas.width = 0;
              shearscx2.canvas.height = 0;
  
              shearscx3.canvas.width = 0;
              shearscx3.canvas.height = 0;
  
              fileArray[nowFile][3].push(['Shears', x1, y1, shearsWidth, shearsHeight, color, size])
              flag_for_shears = false;

              document.getElementById('id_shears').style.removeProperty('color');
            }

          }
        }
      }
      
    }
    input.addEventListener('click', shears)
    return input;
}





// Очистка Canvas
controls.clear = function(cx) {
  let i = elt('i', {class: 'fa fa-refresh'})
  var link_new = elt("button", {class: `btn ${localTheme}btn`, id:'id_clear'}, i);
    function clear() {
      if(countFile != 0){
        cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
        let array_for_shears = [];
        for(let i=0;i<fileArray[nowFile][3].length;i++){
          if(fileArray[nowFile][3][i][0] == 'Shears'){
            array_for_shears.push(fileArray[nowFile][3][i])
          }
        }
        fileArray[nowFile][3] = array_for_shears;
      }
    }
    link_new.addEventListener("click", clear);
    return link_new;
};

var part_number = null;
controls.number = function(cx){
  var number_part = elt('span', {id: "id_number_part"}, `Деталь: `)
  return number_part;
}

function checkorder(){
  for(let i=0; i<countFile; i++){
    document.getElementById(`id_filebar_a${i+1}`).textContent = `[${i+1}] ${fileArray[i][0]}`
  }
}

var remrightnow;
function remphoto(){
  if(confirm('Выбранное фото будет удалено.')){
    fileArray.splice(nowFile,1)
    document.getElementById(`id_filebar_a${nowFile+1}`).remove()
    countFile -=1;
    for(let i=nowFile+1; i<=countFile;i++){
      document.getElementById(`id_filebar_a${i+1}`).id = `id_filebar_a${i}`
    }
    cx2.canvas.width = 0;
    cx2.canvas.height = 0;
    cx.canvas.width = 0;
    cx.canvas.height = 0;
    if(countFile != 0){
      if(nowFile == countFile){
        filebartocanvas(fileArray[nowFile-1][0])
      }
      else{
        filebartocanvas(fileArray[nowFile][0])
      }
    }else{
      allfiles.appendChild(text_upload_file1)
      allfiles.appendChild(text_upload_file2)

      infobar.textContent = '';
    }
    checkorder()
  }
}

var numberscroll = 0;
var numbers_photo =[];
// После нажатия на кнопку на Filebar срабаотывает эта функция, которая передает значения в loadImageURL()
var nowFile = 0;
async function filebartocanvas(name){
    shearscx.canvas.width = 0;
    shearscx.canvas.height = 0;
    for(let i=0;i<countFile;i++){
        if(name == fileArray[i][0]){
            nowFile = i;
            cx = fileArray[i][1];
            ourfile = fileArray[i][2];
            var commands = fileArray[i][3];
            var id = 'id_filebar_a' + String(i+1);
            break;
        }
    }
    for(let i=0;i<countFile;i++){
      document.getElementById('id_filebar_a' + String(i+1)).classList.remove('highlight')
    }

    var highlight = document.getElementById(id)
    highlight.classList.add('highlight')
    numberscroll=(nowFile)*40
    allfiles.scrollTo(0,numberscroll)


    var reader = new FileReader();
    await new Promise(resolve => {
      reader.readAsDataURL(ourfile);
      reader.onload = async function(){
          await loadImageURL2(cx2, reader.result)
          await loadImageURL(cx, reader.result, commands);
          document.getElementById('id_canvas').style = 'display: block;';
          document.getElementById('id_canvas2').style = 'display: block;';

        resolve();
      };
    }).then();
    infobar.textContent = 'Файл: ' + name;
    cx.fillStyle = global_color;
    cx.strokeStyle =global_color;
    cx.lineWidth = global_size;
}



// Отрисовываем Canvas
var x;
var y;
async function loadImageURL(cx, url, commands) {

  await new Promise(resolve => {
    image.src = url;
    image.onload = function() {
      var color = cx.fillStyle, size = cx.lineWidth;
      ratio = image.height / image.width
      x = image.width;
      y = image.height;

      if(x >= 1300){
        while(x >= 1300){
          x -= (x*1.1-x)
          y -= (y*1.1-y)
        }
      }
      if(y >= 610){
        while(y >= 610){
          x -= (x*1.1-x)
          y -= (y*1.1-y)
        }
      }

      cx.canvas.width = x;
      cx.canvas.height = y;

      cx.fillStyle = color;
      cx.strokeStyle = color;
      cx.lineWidth = size;
      cx.shadowOffsetX = 0
      cx.shadowOffsetY = 0
      cx.shadowBlur = 0
      var fixlineWidth = cx.lineWidth
      var fixstrokeStyle = cx.strokeStyle
      for(let i=0; i<commands.length; i++){

          if(commands[i][0] == 'Line'){
              cx.shadowOffsetX = 0
              cx.shadowOffsetY = 0
              cx.shadowBlur = 0
              cx.lineWidth = commands[i][1];
              cx.strokeStyle = commands[i][2];
              cx.lineCap = "round";
              flagLine = true;
              
              for(let j=0; j<commands[i][3].length-1;j++){
                  cx.beginPath()
                  cx.moveTo(commands[i][3][j][0],commands[i][3][j][1]);
                  cx.lineTo(commands[i][3][j+1][0],commands[i][3][j+1][1]);
                  cx.stroke();
              }
          }

          if(commands[i][0] == 'Erase'){
            cx.shadowOffsetX = 0
            cx.shadowOffsetY = 0
            cx.shadowBlur = 0
            cx.globalCompositeOperation = "destination-out";
            cx.lineWidth = commands[i][1];
            cx.strokeStyle = commands[i][2];
            cx.lineCap = "round";
            flagLine = true;
            
            for(let j=0; j<commands[i][3].length-1;j++){
                cx.beginPath()
                cx.moveTo(commands[i][3][j][0],commands[i][3][j][1]);
                cx.lineTo(commands[i][3][j+1][0],commands[i][3][j+1][1]);
                cx.stroke();
            }
            cx.globalCompositeOperation = "source-over"
        }
        if(commands[i][0] == 'Shears'){
          let x1 = commands[i][1];
          let y1 = commands[i][2];
          let shearsWidth = commands[i][3];
          let shearsHeight = commands[i][4];
          let color = commands[i][5];
          let size = commands[i][6];

          shearscx2.canvas.width = shearsWidth;
          shearscx2.canvas.height = shearsHeight;

          shearscx3.canvas.width = shearsWidth;
          shearscx3.canvas.height = shearsHeight; 


          shearscx2.drawImage(cx2.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);
          shearscx3.drawImage(cx.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);

          cx2.canvas.width = shearsWidth;
          cx2.canvas.height = shearsHeight;
          cx.canvas.width = shearsWidth;
          cx.canvas.height = shearsHeight;


          document.getElementById('id_canvas').style = 'display: none;';
          document.getElementById('id_canvas2').style = 'display: none;';

          cx2.drawImage(shearscx2.canvas, 0,0,shearsWidth, shearsHeight)
          cx.drawImage(shearscx3.canvas, 0,0,shearsWidth, shearsHeight)

          cx.lineWidth = size;
          cx.strokeStyle = color;
          cx.fillStyle = color;

          shearscx.canvas.width = 0;
          shearscx.canvas.height = 0;

          shearscx2.canvas.width = 0;
          shearscx2.canvas.height = 0;

          shearscx3.canvas.width = 0;
          shearscx3.canvas.height = 0;
        }
      }
      cx.lineWidth = fixlineWidth;
      cx.strokeStyle = fixstrokeStyle;
      resolve();
    };
  }).then();
}

async function loadImageURL2(cx2, url) {

  await new Promise(resolve => {
    image.src = url;
    image.onload = function() {
      document.getElementById('id_canvas').style = 'display: none;';
      document.getElementById('id_canvas2').style = 'display: none;';
      ratio = image.height / image.width
      x = image.width;
      y = image.height;

      cx3.canvas.width = x;
      cx3.canvas.height = y;

      cx3.drawImage(image,0,0,x,y);

      var RED = cx3.getImageData(0,0,x,y);
      var redColors = RED.data

      for(let i = 0; i<redColors.length;i+=4){

        if(String(redColors[i]) in dict){
          let number = String(redColors[i]);
          redColors[i] = dict[number][0]
          redColors[i+1] = dict[number][1]
          redColors[i+2] = dict[number][2]
          
        }
      }
      cx3.putImageData(RED, 0, 0);

      if(x >= 1300){
        while(x >= 1300){
          x -= (x*1.1-x)
          y -= (y*1.1-y)
        }
      }
      if(y >= 610){
        while(y >= 610){
          x -= (x*1.1-x)
          y -= (y*1.1-y)
        }
      }
      cx2.canvas.width = x;
      cx2.canvas.height = y;

      cx2.drawImage(cx3.canvas,0,0,x,y);
      resolve();
    };
  }).then();
}


async function secretfilebartocanvas(name){
  for(let i=0;i<countFile;i++){
      if(name == fileArray[i][0]){
          nowFile = i;
          ourfile = fileArray[i][2];
          var commands = fileArray[i][3];
          break;
      }
  }
  var reader = new FileReader();
  await new Promise(resolve => {
    reader.readAsDataURL(ourfile);
    reader.onload = async function(){

      await secretloadImageURL(secretcx, reader.result, commands);

      resolve();
    };
  }).then();
}



// Отрисовываем Canvas
var x;
var y;
var flag_for_shears_download = false;
async function secretloadImageURL(secretcx, url, commands) {

await new Promise(resolve => {
  image.src = url;
  image.onload = function() {
    var color = secretcx.fillStyle, size = secretcx.lineWidth;
    ratio = image.height / image.width
    x = image.width;
    y = image.height;

    if(x >= 1300){
      while(x >= 1300){
        x -= (x*1.1-x)
        y -= (y*1.1-y)
      }
    }
    if(y >= 610){
      while(y >= 610){
        x -= (x*1.1-x)
        y -= (y*1.1-y)
      }
    }

    secretcx.canvas.width = x;
    secretcx.canvas.height = y;
    secretcx2.canvas.width = x;
    secretcx2.canvas.height = y;

    secretcx2.drawImage(image, 0,0, x,y);

    secretcx.fillStyle = color;
    secretcx.strokeStyle = color;
    secretcx.lineWidth = size;
    cx.shadowOffsetX = 0
    cx.shadowOffsetY = 0
    cx.shadowBlur = 0
    var fixlineWidth = secretcx.lineWidth
    var fixstrokeStyle = secretcx.strokeStyle
    for(let i=0; i<commands.length; i++){

      if(commands[i][0] == 'Line'){
        cx.shadowOffsetX = 0
        cx.shadowOffsetY = 0
        cx.shadowBlur = 0
        secretcx.lineWidth = commands[i][1];
        secretcx.strokeStyle = commands[i][2];
        secretcx.lineCap = "round";
        
        for(let j=0; j<commands[i][3].length-1;j++){
          secretcx.beginPath()
          secretcx.moveTo(commands[i][3][j][0],commands[i][3][j][1]);
          secretcx.lineTo(commands[i][3][j+1][0],commands[i][3][j+1][1]);
          secretcx.stroke();
        }
      }
      if(commands[i][0] == 'Erase'){
        cx.shadowOffsetX = 0
        cx.shadowOffsetY = 0
        cx.shadowBlur = 0
        secretcx.globalCompositeOperation = "destination-out";
        secretcx.lineWidth = commands[i][1];
        secretcx.strokeStyle = commands[i][2];
        secretcx.lineCap = "round";
        
        for(let j=0; j<commands[i][3].length-1;j++){
          secretcx.beginPath()
          secretcx.moveTo(commands[i][3][j][0],commands[i][3][j][1]);
          secretcx.lineTo(commands[i][3][j+1][0],commands[i][3][j+1][1]);
          secretcx.stroke();
        }
        secretcx.globalCompositeOperation = "source-over"
      }
      if(commands[i][0] == 'Shears'){
        flag_for_shears_download = true;
        let x1 = commands[i][1];
        let y1 = commands[i][2];
        let shearsWidth = commands[i][3];
        let shearsHeight = commands[i][4];

        shearscx2.canvas.width = shearsWidth;
        shearscx2.canvas.height = shearsHeight;

        shearscx3.canvas.width = shearsWidth;
        shearscx3.canvas.height = shearsHeight; 


        shearscx2.drawImage(secretcx2.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth, shearsHeight);

        shearscx3.drawImage(secretcx.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth, shearsHeight);

        secretcx.canvas.width = shearsWidth;
        secretcx.canvas.height = shearsHeight;

        secretcx2.canvas.width = shearsWidth;
        secretcx2.canvas.height = shearsHeight;


        secretcx.drawImage(shearscx3.canvas, 0,0,shearsWidth, shearsHeight)
        secretcx2.drawImage(shearscx2.canvas, 0,0,shearsWidth, shearsHeight)

        x = shearsWidth;
        y = shearsHeight;
  

        shearscx.canvas.width = 0;
        shearscx.canvas.height = 0;

        shearscx2.canvas.width = 0;
        shearscx2.canvas.height = 0;

        shearscx3.canvas.width = 0;
        shearscx3.canvas.height = 0;
        
      }


      
    }
    secretcx.lineWidth = fixlineWidth;
    secretcx.strokeStyle = fixstrokeStyle;

    var RAINBOW = secretcx.getImageData(0,0,x,y);
      var rainbowColors = RAINBOW.data
      for(let i = 0; i<rainbowColors.length;i+=4){
        let ourcolor = [rainbowColors[i], rainbowColors[i+1], rainbowColors[i+2]]
        if(ourcolor in dict2){
          let number = ourcolor;
          rainbowColors[i] = Number(dict2[number])
          rainbowColors[i+1] = 0;
          rainbowColors[i+2] = 0;
        }
        else{
          rainbowColors[i] = 0;
          rainbowColors[i+1] = 0;
          rainbowColors[i+2] = 0;
          rainbowColors[i+3] = 0;
        }
      }

      secretcx.putImageData(RAINBOW, 0, 0);



    secretcx3.canvas.width = x;
    secretcx3.canvas.height = y;
    secretcx3.drawImage(secretcx2.canvas,0,0,x,y);
    secretcx3.drawImage(secretcx.canvas,0,0,x,y);

   
    resolve();
  };
}).then();
}


controls.save = function(cx) {
  var link = elt("button", {class: `btn ${localTheme}btn`, id: "id_save"}, "Сохранить");


  async function download() {
    if(countFile != 0){
      document.getElementById('id_secretcanvas').style = 'display: none;'
      if(countFile != 1){
        var zip = new JSZip();
        let fornowFile = nowFile;
        for(let i=0;i<countFile;i++){
          await secretfilebartocanvas(fileArray[i][0]);
          let filename = [fileArray[i][0].slice(0, fileArray[i][0].length-4), "_new", fileArray[i][0].slice(fileArray[i][0].length-4)].join('')
          zip.file(`${filename}`, dataURLtoBlob(secretcx3.canvas.toDataURL()));

          secretcx.canvas.width = 0;
          secretcx.canvas.height = 0;

          secretcx2.canvas.width = 0;
          secretcx2.canvas.height = 0;
          
          secretcx3.canvas.width = 0;
          secretcx3.canvas.height = 0;
        }
        zip.generateAsync({type:'blob'})
        .then((content) => {
          saveAs(content, 'out.zip')
        })
        filebartocanvas(fileArray[fornowFile][0])
      }else{
        await secretfilebartocanvas(fileArray[0][0]);
        let img = secretcx3.canvas.toDataURL("image/png");
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            a.download = `${fileArray[0][0]}_new.png`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        };
        xhr.open('GET', img);
        xhr.send();
        filebartocanvas(fileArray[0][0])
      }
      // console.log('done')
      document.getElementById('id_canvas').style = 'display: inline;'
    }
  }
  link.addEventListener("click", download);
  return link;
};

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], );
}


function KeyPress(e) {
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
      
      if(fileArray[nowFile][3][fileArray[nowFile][3].length-1][0] != 'Shears'){
      
        fileArray[nowFile][3].pop();
        fileArray[nowFile][3].pop();
      }else{
        fileArray[nowFile][3].pop();
      }
        filebartocanvas(fileArray[nowFile][0]);
        e.preventDefault();
    }
    if(evtobj.keyCode == 40 || evtobj.keyCode == 39){
      if(nowFile!=countFile-1){
        filebartocanvas(fileArray[nowFile+1][0])
      }
    }
    if(evtobj.keyCode == 38 || evtobj.keyCode == 37){
      if(nowFile!=0){
        filebartocanvas(fileArray[nowFile-1][0])
      }
    }

}       
document.onkeydown = KeyPress;

// Смена темы
controls.theme = function(cx) {
    var new_theme = elt("select", {class: `btn ${localTheme}btn`, id:'id_theme'});
    var themes = ['Светлая', 'Тёмная'];
    themes.forEach(function(theme) {
        if(flag_for_select) {
            if(theme=='Тёмная'){
                new_theme.appendChild(elt("option", {value:theme, selected:'selected'},"Тёмная"));
                flag_for_select = false;
            }else{new_theme.appendChild(elt("option",{value:theme},"Светлая"));}
        }
        else{
            new_theme.appendChild(elt("option",{value:theme},theme));
        }
    });


    new_theme.addEventListener("change", function(){
      if (new_theme.value == 'Светлая'){
        localStorage.setItem('theme', 'Светлая')

        // Body, Toolbar, Filebar, Footer
        document.getElementById('body').classList.remove('darkBody');
        document.getElementById('body').classList.add('lightBody');
        document.getElementById('id_toolbar').classList.remove('darkToolFileFooterbar');
        document.getElementById('id_toolbar').classList.add('lightToolFileFooterbar');
        document.getElementById('id_filebar').classList.remove('darkToolFileFooterbar');
        document.getElementById('id_filebar').classList.add('lightToolFileFooterbar');
        document.getElementById('id_allfiles').classList.remove('darkToolFileFooterbar');
        document.getElementById('id_allfiles').classList.add('lightToolFileFooterbar');
        document.getElementById('id_infobar').classList.remove('darkToolFileFooterbar');
        document.getElementById('id_infobar').classList.add('lightToolFileFooterbar');

        // Buttons
        document.getElementById('id_pipe').classList.add('lightbtn')
        document.getElementById('id_pipe').classList.remove('darkbtn')
        document.getElementById('id_buttonREM').classList.add('lightbtn')
        document.getElementById('id_buttonREM').classList.remove('darkbtn')
        document.getElementById('id_buttonDOWN').classList.add('lightbtn')
        document.getElementById('id_buttonDOWN').classList.remove('darkbtn')
        document.getElementById('id_buttonUP').classList.add('lightbtn')
        document.getElementById('id_buttonUP').classList.remove('darkbtn')
        document.getElementById('id_shears').classList.add('lightbtn')
        document.getElementById('id_shears').classList.remove('darkbtn')
        document.getElementById('id_save').classList.add('lightbtn')
        document.getElementById('id_save').classList.remove('darkbtn')
        document.getElementById('id_clear').classList.add('lightbtn')
        document.getElementById('id_clear').classList.remove('darkbtn')
        document.getElementById('id_color').classList.add('lightbtn')
        document.getElementById('id_color').classList.remove('darkbtn')
        document.getElementById('id_theme').classList.add('lightbtn')
        document.getElementById('id_theme').classList.remove('darkbtn')
        document.getElementById('id_tool').classList.add('lightbtn')
        document.getElementById('id_tool').classList.remove('darkbtn')
        document.getElementById('id_size').classList.add('lightbtn')
        document.getElementById('id_size').classList.remove('darkbtn')
        document.getElementById('id_file-upload').classList.add('lightbtn')
        document.getElementById('id_file-upload').classList.remove('darkbtn')
        
        // Scroll
        document.getElementById('id_filebar').style = 'color-scheme: light;';

        // Elements of Filebar
        for(let i=1;i<=countFile;i++) {
          document.getElementById(`id_filebar_a${i}`).classList.remove('darkbtn_a');
          document.getElementById(`id_filebar_a${i}`).classList.add('lightbtn_a');
        }
      }
      if (new_theme.value == 'Тёмная'){
        localStorage.setItem('theme', 'Тёмная')

        // Body, Toolbar, Filebar, Footer
        document.getElementById('body').classList.remove('lightBody');
        document.getElementById('body').classList.add('darkBody');
        document.getElementById('id_toolbar').classList.remove('lightToolFileFooterbar');
        document.getElementById('id_toolbar').classList.add('darkToolFileFooterbar');
        document.getElementById('id_filebar').classList.remove('lightToolFileFooterbar');
        document.getElementById('id_filebar').classList.add('darkToolFileFooterbar');
        document.getElementById('id_allfiles').classList.remove('lightToolFileFooterbar');
        document.getElementById('id_allfiles').classList.add('darkToolFileFooterbar');
        document.getElementById('id_infobar').classList.remove('lightToolFileFooterbar');
        document.getElementById('id_infobar').classList.add('darkToolFileFooterbar');

        // Buttons
        document.getElementById('id_pipe').classList.remove('lightbtn')
        document.getElementById('id_pipe').classList.add('darkbtn')
        document.getElementById('id_buttonREM').classList.remove('lightbtn')
        document.getElementById('id_buttonREM').classList.add('darkbtn')
        document.getElementById('id_buttonDOWN').classList.remove('lightbtn')
        document.getElementById('id_buttonDOWN').classList.add('darkbtn')
        document.getElementById('id_buttonUP').classList.remove('lightbtn')
        document.getElementById('id_buttonUP').classList.add('darkbtn')
        document.getElementById('id_shears').classList.remove('lightbtn')
        document.getElementById('id_shears').classList.add('darkbtn')
        document.getElementById('id_save').classList.remove('lightbtn')
        document.getElementById('id_save').classList.add('darkbtn')
        document.getElementById('id_clear').classList.remove('lightbtn')
        document.getElementById('id_clear').classList.add('darkbtn')
        document.getElementById('id_color').classList.remove('lightbtn')
        document.getElementById('id_color').classList.add('darkbtn')
        document.getElementById('id_theme').classList.remove('lightbtn')
        document.getElementById('id_theme').classList.add('darkbtn')
        document.getElementById('id_tool').classList.remove('lightbtn')
        document.getElementById('id_tool').classList.add('darkbtn')
        document.getElementById('id_size').classList.remove('lightbtn')
        document.getElementById('id_size').classList.add('darkbtn')
        document.getElementById('id_file-upload').classList.remove('lightbtn')
        document.getElementById('id_file-upload').classList.add('darkbtn')
        
        // Scroll
        document.getElementById('id_filebar').style = 'color-scheme: dark;';

        // Elements of Filebar
        for(let i=1;i<=countFile;i++) {
          document.getElementById(`id_filebar_a${i}`).classList.remove('lightbtn_a');
          document.getElementById(`id_filebar_a${i}`).classList.add('darkbtn_a');          
        }
      }
      document.getElementById("id_theme").blur();
    });
    return new_theme;
  };

// Запуск
createPaint(document.body);
