// Описание основных алгоритмов

// Кнопка «Маски»: 
// Загружает файлы формата png/jpg/json. После загрузки файлов добавляет в fileArray массив формата [filename,cx.canvas, fileReader,[]].
 
// Для отображение файлов на канвасе используется функция filebartocanvas(filename). Это функция отображает два слоя cx.canvas(используется для рисования)и cx2.canvas(используется для отображения нижнего слоя), а также отображает все действия выполненные над канвасом из fileArray[nowFile][3].

// Процесс рисования: 
// Кисть, ластик, линия это инструменты рисования, которые рисуются на cx.canvas.
// При каждом действии инструмента передаются координатыи название этого действия в fileArray[nowFile][3].

// Особенности инструмента линии:
// Сама Линия рисуется на другом канвасе ( linecx.canvas ), но моментально переносится на основной канвас (cx.canvas)


// Процесс вырезания:
// При нажатии на кнопку вырезания у нас появляется канвас (shearscx.canvas). После выделения области мы используем еще 2 канваса (shearscx2.canvas и shearscx3.canvas). Событие ножниц также попадает в fileArray[nowFile][3].

// Очистка холста происходит только на канвасе cx.canvas. Очистка также очищает fileArray[nowFile][3] за исключением событий ножниц.

// Процесс замены:
// С помощью getImageData() мы проходим по всем пикселям двух слоев и меняем нужный цвет на новый.  Событие замены также попадает в fileArray[nowFile][3].

// Процесс черной кисти:
// При нажатии на кнопку появляется канвас blackcx.canvas. Уже на нем мы рисуем. А далее просто сравниваем его с cx.canvas и cx2.canvas.

// Скачивание происходит путем перегона всех фоток на канвасе secretcx.canvas.

// Функция генерации HTML элементов (нужна для удобства)
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

// меняем цвет body и задаем флаг для темы
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


var controls = Object.create(null); // Панель toolbar
var image = document.createElement("img");
var ratio;
var infobar; // название файла на filebar
var cx; // контекст канваса для рисования
var secretcx; // контекст канваса для скачивания
var secretcx2; // контекст канваса для скачивания
var secretcx3; // контекст канваса для скачивания
var cx2; // контекст канваса для фона
var shearscx; // контекст канваса с ножницами
var shearscx2; // контекст канваса с ножницами
var shearscx3; // контекст канваса с ножницами
var cx3; 
var originalcx; // контекст канваса для оригинала
var blackcx; // контекст канваса для черной кисти
var linecx; // контекст канваса для линии

var global_size = 5; // размер кисти
var cursor = elt('div', {id:'id_cursor'}); // курсор канваса
var allfiles, text_upload_file1, text_upload_file2; // div, span, span

var fileArrayOriginal_name = []; // массив названий оригиналов
var fileArrayOriginal = []; // масссив оригинало
var flag_for_orig = false; // флаг для оригинала

// Открытие файлов лейблом в виде кнопки
var fileArray_name = [];
var fileArray = []; // Массив хранение информации о файлах (на момент v3.3 имеет вид -> [['name1.png', cx, url], ['name2.png', cx, url], ...])
var countFile = 0; // Количество файлов в Filebar
var flag_for_remove_text = true; // флаг используется для удаления надписи "UPLOAD FILE" в Filebar

var shears_json2 = {}; // используется для json файла
var shears_json = {}; // используется для json файла
var x1,x2,y1,y2; // используется для json файла
var flag_for_shears = false; // используется для json файла

// Цвет кисти
var global_color;
var flag_for_pipe = false;

// Словарь с цветами
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
  "75": [255, 120, 120],
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
  "90": [255, 0, 10],
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
  "109": [40, 50, 5],
  "112": [117, 254, 165],
  "113": [162, 125, 252],
  "116": [255, 94, 30],
  "117": [89, 255, 144],
  "118": [181, 183, 255],
  "119": [186, 255, 229],
  "120": [255, 152, 217],
  "121": [96, 255, 131],
  "122": [255, 63, 0],
  "123": [180, 69, 16]};

// варианты поедставления словаря (для удобства)
const dict2 = {};

Object.entries(dict).forEach(([key, value]) => {
  dict2[value] = key
})

const dict3 = {};

Object.entries(dict).forEach(([key, value]) => {
  dict3[value] = [Number(key), 0, 0]
})

const dict4 = {};

Object.entries(dict).forEach(([key, value]) => {
  dict4[[Number(key), 0, 0]] = value
})

// Объект для Кисти, Линии, Ластика
var tools = Object.create(null);

// Detail
var part_number = null;

// Black paint
var flag_for_bbrush = true;

// Color switch
var flag_for_switch_btn = false;
var array_for_switch = [];
var flag_for_switch = false;

var remrightnow; // remove file

var numberscroll = 0; //для скрола
var numbers_photo =[]; 
var nowFile = -1; // индекс в fileArray текущего канваса на холсте

var flag_for_shears_download = false; // флаг для ножниц


















// Все элементы родителя body
function createPaint(parent) {

    cursor = elt('div', {id:'id_cursor', width:'20px', height:'20px'})
    
    // КАНВАСЫ

    var canvas3 = elt("canvas", {id: 'id_canvas3', width: 0, height: 0, style: 'display:none;'})
    cx3 = canvas3.getContext("2d") 

    var canvas = elt("canvas", {id: 'id_canvas', width: 0, height: 0});
    cx = canvas.getContext("2d");

    var canvas2 = elt("canvas", {id: 'id_canvas2', width: 0, height: 0});
    cx2 = canvas2.getContext("2d");

    var blackcanvas = elt("canvas", {id: 'id_blackcanvas', width: 0, height: 0});
    blackcx = blackcanvas.getContext("2d");

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

    var originalcanvas = elt('canvas', {id: 'id_originalcanvas', width:0, height:0})
    originalcx = originalcanvas.getContext("2d")

    var linecanvas = elt('canvas', {id: 'id_linecanvas', width:0, height:0})
    linecx = linecanvas.getContext("2d")

    var zoomcanvas = elt('canvas', {id: 'id_zoomcanvas', width:0, height:0})
    zoomcx = zoomcanvas.getContext("2d")

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
    var buttonALLREM = elt("button", {href: '#', class:`btn ${localTheme}btn btn_updownrem`, id:'id_buttonALLREM'}, 'Удалить все (DBL_CLICK)')
    var filebar = elt("div", {class: `filebar ${localTheme}ToolFileFooterbar`, id: 'id_filebar'}, allfiles,buttonUP, buttonDOWN, buttonREM,buttonALLREM, infobar);


    // switch color
    var exitswitch = elt("button", {class: `btn ${localTheme}btn`, id: 'id_exitswitch'}, 'Заменить')
    var textswitch = elt('span', {id: 'id_textswitch'}, 'Замена одного цвета на другой:')
    var firstcolor = elt("select", {class: `btn ${localTheme}btn`, id: 'id_firstcolor'})
    for(let i in dict){
      firstcolor.appendChild(elt("option", {value: i, style:`background: rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]});`}, i));
    }

    var secondcolor = elt("select", {class: `btn ${localTheme}btn`, id: 'id_secondcolor'})
    for(let i in dict){
      secondcolor.appendChild(elt("option", {value: i, style:`background: rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]});`}, i));
    }

    var textblackbrush = elt("div", {id: "id_textblackbrush"}, 'Наложение слоя на черный цвет')
    var readyblackbrush = elt('button', {class: `btn ${localTheme}btn`, id: 'id_readyblackbrush'}, 'Готово')
    var windowblackbrush = elt("div",{class: `${localTheme}ToolFileFooterbar`, id: "id_windowblackbrush"}, textblackbrush, readyblackbrush)

    var windowswitch = elt("div", {class: `${localTheme}ToolFileFooterbar`, id: "id_windowswitch"}, textswitch, firstcolor, secondcolor, exitswitch)

    var inputopacity = elt("input", {id: 'id_inputopacity',ENGINE:"range",type:"range", min:"1", max:"100", value:"100"})
    var windowopacity = elt("div", { class: `${localTheme}ToolFileFooterbar`,id: "id_windowopacity"},inputopacity)


    // блоки блокирующие нажатие
    var block_filebar = elt('div', {id: 'id_block_filebar'})
    var block_toolbar = elt('div', {id: 'id_block_toolbar'})
    var block_all = elt('div', {id:'id_block_all'})

    // Объединение Filebar и Canvas
    var panel = elt("div", {class: "filebar_and_canvas"}, filebar, canvas2, canvas, secretcanvas, secretcanvas2, secretcanvas3, shearscanvas, shearscanvas2, shearscanvas3,originalcanvas, blackcanvas, linecanvas, cursor, windowswitch, windowblackbrush, windowopacity, zoomcanvas);

    var progressbar = elt('progress', {id: 'id_progressbar', value: 0, max: 0})
    var progress_text = elt("div", {id: 'id_progress_text'}, "Скачивание файлов: 0/10")
    var progress = elt("div", {id:"id_windowprogressbar"}, progress_text, progressbar)
    parent.appendChild(elt("div", {id: 'id_main'}, progress, toolbar, panel, block_all, block_filebar, block_toolbar)); // Запуск

    window.onbeforeunload = function(event)
    {
        return confirm("Confirm refresh");
    };

    // ОБРАБОТКА СОБЫТИЙ КУРСОРА
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
        if(rgb[0] == 0 && rgb[1] == 0 && rgb[2] == 0){
          document.getElementById('id_number_part').textContent = `Деталь: `
          cursor.style.border = `5px dotted black`

          break;
        }
        if((Math.abs(rgb[0] - dict[i][0]) <= 3) && (Math.abs(rgb[1] - dict[i][1]) <= 3) && (Math.abs(rgb[2] - dict[i][2]) <= 3)){
          document.getElementById('id_number_part').textContent = `Деталь: ${i}`
          cursor.style.border = `5px dotted rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`
          
          break;
        }
      }



          if(getI[0] == 0 && getI[1] == 0 && getI[2] == 0 && getI[3] == 0){
            rgb = [getI2[0], getI2[1], getI2[2]]
          }else{
            rgb = [getI[0], getI[1], getI[2]]
          }



      cursor.style.display = 'block';
      // cursor.style.border = `5px dotted white`;
      cursor.style.width =global_size + 'px';
      cursor.style.height = global_size + 'px';
      cursor.style.left = event.clientX -Math.round(global_size/2) -3+ 'px';
      cursor.style.top = event.clientY- Math.round(global_size/2) -3 + 'px';
      cx.canvas.addEventListener('mouseout', ()=>{
        cx.canvas.onmousemove = null;
        cursor.style.display = 'none';
      })
    })

    	        // localStorage.clear()
      // if(localStorage.getItem('images') == null){
      //   console.log('null')
      //   localStorage.setItem('images', JSON.stringify([]))
      // }else{
      //   fileArray = JSON.parse(localStorage.getItem('images'))
      //   countFile = fileArray.length;
        
      //   // JSON shears 

      //   for(let i=0;i<countFile;i++){
      //     shears_json[fileArray[i][0]] = []
      //     for(let j=0;j<fileArray[i][3].length;j++){
      //       if(fileArray[i][3][j][0] == 'Shears'){
      //         shears_json[fileArray[i][0]].push([fileArray[i][3][j][1],fileArray[i][3][j][2],fileArray[i][3][j][3],fileArray[i][3][j][4]])
      //       }
      //     }
      //   }

      //   if(countFile != 0){
      //     document.getElementById("id_text_upload_file1").style.display = 'none';
      //     document.getElementById("id_text_upload_file2").style.display = 'none';
      //     flag_for_remove_text = false;
        
      //     for(let i = 0;i<countFile;i++){

      //       fileArray_name.push(fileArray[i][0])

      //       var a = document.createElement('button');
      //       a.setAttribute('href','#');
      //       a.setAttribute('onClick','filebartocanvas("' + `${String(fileArray[i][0])}` + '")'); // При нажатии на кнопку включается функция, в которую передаём название файла 
      //       a.setAttribute('onClick','filebartocanvas("' + `${String(fileArray[i][0])}` + '")'); // При нажатии на кнопку включается функция, в которую передаём название файла 
      //       a.setAttribute('id',`id_filebar_a${i+1}`)
      //       if(localStorage.getItem('theme') == 'Светлая'){
      //           a.setAttribute('class', 'btn_a lightbtn_a');
      //       }else{
      //         a.setAttribute('class', 'btn_a darkbtn_a');
      //       }
      //       a.textContent = '○ ' + String("["+String(i+1)+"] " + fileArray[i][0]);
            
      //       var filebarA = document.querySelector('#id_allfiles');
      //       filebarA.appendChild(a);
      //     }
      //     filebartocanvas(fileArray[0][0])
      //   }
      // }
    
      // localStorage.setItem('images', JSON.stringify([]))
      


      // Функция удаления всех файлов в fileArray 
      let remAllFiles = document.getElementById('id_buttonALLREM')

      remAllFiles.ondblclick = () => {
        if(confirm('Подтвердите удаление всех файлов.')){
          console.log(document.getElementById('id_inputopacity').value)
          // localStorage.setItem('images', JSON.stringify([]))

          fileArray_name = [];
          fileArray = [];
          shears_json = {}

          for(let i = 0;i<countFile; i++){
            document.getElementById(`id_filebar_a${i+1}`).remove()
          }
          allfiles.appendChild(text_upload_file1)
          allfiles.appendChild(text_upload_file2)

          document.getElementById("id_text_upload_file1").style.display = 'block';
          document.getElementById("id_text_upload_file2").style.display = 'block';
          flag_for_remove_text = true;
          cx2.canvas.width = 0;
          cx2.canvas.height = 0;
          cx.canvas.width = 0;
          cx.canvas.height = 0;
          infobar.textContent = '';
          countFile = 0;
          nowFile = -1;
        }
      }
      let inputlistener = document.getElementById('id_inputopacity')
      inputlistener.onchange = () => {
        document.getElementById('id_originalcanvas').style.opacity = `${inputlistener.value}%`
      }

      // ZOOM


	

} 


// Кнопка вверх
function upphoto(){
  if(nowFile!=0){
    filebartocanvas(fileArray[nowFile-1][0])
  }
}
// Кнопка вниз
function downphoto(){
  if(nowFile!=countFile-1){
    filebartocanvas(fileArray[nowFile+1][0])
  }
}


var color_a = 'black';
controls.openFile = function(cx) {
  var input = elt("input", {type:"file", class:`btn ${localTheme}btn`, id:'file-upload', multiple:"",accept:"image/png, image/jpeg, .json"});
  input.addEventListener("change", function() {


    // Заполняем массив (вид - [['name1.png', cx, url, [command]], ['name2.png', cx, url, [command]], ...])
    let flag_for_json = false;
    if(input.files.length == 0) return;
    let need_for_fix = 0;
      for(let i=0;i<input.files.length;i++){
        if(input.files[i].name.substr(input.files[i].name.length - 5)== '.json'){
          var file_to_read = input.files[i];
          var fileread = new FileReader();
          fileread.onload = function(e) {
            var content = e.target.result;
            shears_json2 = JSON.parse(content); // Array of Objects.
          };
          fileread.readAsText(file_to_read);

          flag_for_json = true;
          
          continue;
        }
      if(fileArray_name.includes(input.files[i].name)) {continue;}
      else{fileArray_name.push(input.files[i].name)}
        need_for_fix += 1;
        fileArray.push([input.files[i].name,cx, input.files[i],[]]);
        
        // Создаем для каждого фото свою кнопку для отображения на Filebar
        var a = document.createElement('button');
        a.setAttribute('href','#');
        a.setAttribute('onClick','filebartocanvas("' + `${String(input.files[i].name)}` + '")'); // При нажатии на кнопку включается функция, в которую передаём название файла 
        a.setAttribute('onClick','filebartocanvas("' + `${String(input.files[i].name)}` + '")'); // При нажатии на кнопку включается функция, в которую передаём название файла 
        a.setAttribute('id',`id_filebar_a${countFile+need_for_fix}`)
        if(localStorage.getItem('theme') == 'Светлая'){
            a.setAttribute('class', 'btn_a lightbtn_a');
        }else{
          a.setAttribute('class', 'btn_a darkbtn_a');
        }
        if(fileArrayOriginal_name.includes(input.files[i].name)){

          a.textContent = '● ' + String("["+String(countFile+need_for_fix)+"] " + input.files[i].name);
        }else{

          a.textContent = '○ ' + String("["+String(countFile+need_for_fix)+"] " + input.files[i].name);
        }
        
        var filebarA = document.querySelector('#id_allfiles');
        filebarA.appendChild(a);
        
        if(localStorage.getItem('theme') == 'Светлая'){
        document.getElementById('id_filebar').style = 'color-scheme: light;';


        }else{
        document.getElementById('id_filebar').style = 'color-scheme: dark;';
        }
      }
    countFile = fileArray.length; // обнавляем информацию о количестве файлов

    if(flag_for_json && countFile == 0){
      flag_for_remove_text = false;
    }else{
      filebartocanvas(fileArray[0][0])
      flag_for_remove_text = true;
      checkorder()
    }

        // Удаление надписи
    if(flag_for_remove_text && countFile != 0){
      document.getElementById("id_text_upload_file1").style.display = 'none';
      document.getElementById("id_text_upload_file2").style.display = 'none';
      flag_for_remove_text = false;
    }

    
  });
  return elt("label", {for:"file-upload", class:`custom-file-upload ${localTheme}btn`, id:"id_file-upload"}, "Маски" , input);
};


controls.openFileOrig = function(cx) {
  var input = elt("input", {type:"file", class:`btn ${localTheme}btn`, id:'file-upload2', multiple:"",accept:"image/png, image/jpeg"});
  input.addEventListener("change", function() {
    if(input.files.length == 0) return;
    for(let i=0;i<input.files.length;i++){
      if(fileArrayOriginal_name.includes(input.files[i].name)) {continue;}
      else{
        fileArrayOriginal_name.push(input.files[i].name);
      }
      fileArrayOriginal.push([input.files[i].name,cx, input.files[i],[]]);
    }
    checkorder()

  })

  return elt("label", {for:"file-upload2", class:`custom-file-upload2 ${localTheme}btn`, id:"id_file-upload2"}, "Оригиналы" , input);
}


// Логотип
controls.aina = function(cx){
    AINA = elt('span', {id:'id_aina'},'AINA.lab');
    return AINA;
  }

// Инструменты (Кисть, Ластик, Линия)
controls.tool = function(cx) {
  var select = elt("select", {class: `btn ${localTheme}btn`,id: "id_tool"});
  for (var name in tools){
    if(name == 'Brush'){
      select.appendChild(elt("option", null, 'Кисть'));
    }else if(name == 'Erase'){
      select.appendChild(elt("option", null, 'Ластик'));
    }else{
      select.appendChild(elt("option", null, 'Линия'))
    }
  }
  cx.canvas.addEventListener("mousedown", function(event) {
    document.getElementById("id_tool").blur();
    document.getElementById("id_tool").blur();
    if(!flag_for_shears && !flag_for_pipe){
      if (event.which == 1) {
        if(select.value == 'Кисть'){
          tools["Brush"](event, cx);}
        else if(select.value == 'Ластик'){
          tools["Erase"](event, cx);
        }else{
          tools["Line"](event, linecx);
        }
        event.preventDefault();
      }
    }
  });
  blackcx.canvas.addEventListener("mousedown", function(event) {
    document.getElementById("id_tool").blur();
    document.getElementById("id_tool").blur();
    if(!flag_for_shears && !flag_for_pipe){
      if (event.which == 1) {
        if(select.value == 'Кисть'){
          tools["Brush"](event, blackcx);}
        else if(select.value == 'Ластик'){
          tools["Erase"](event, blackcx);
        }else{
          tools["Line"](event, linecx);
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
tools.Brush = function(event, cx, onEnd) {
  if(flag_for_bbrush){
    cx.lineCap = "round";
    cx.lineJoin = "round"
    cx.shadowOffsetX = 0
    cx.shadowOffsetY = 0
    cx.shadowBlur = 0
    var pos = relativePos(event, cx.canvas);
    fileArray[nowFile][3].push(['Brush', cx.lineWidth, cx.strokeStyle,[]])
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    pos = relativePos(event, cx.canvas);
    fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])

    cx.lineTo(pos.x, pos.y);
    cx.stroke();

    fileArray[nowFile][3].push(['Brush', cx.lineWidth, cx.strokeStyle, []])
    zoomcx.canvas.width = cx.canvas.width
    zoomcx.canvas.height = cx.canvas.height
    zoomcx.drawImage(cx.canvas,0,0,cx.canvas.width,cx.canvas.height)
    trackDrag(function(event) {
      cx.beginPath();
      cx.moveTo(pos.x, pos.y);
      fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
      pos = relativePos(event, cx.canvas);
      cx.lineTo(pos.x, pos.y);
      cx.stroke();
      fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
      
    }, onEnd);
  }else{
    cx.lineCap = "round";
    var pos = relativePos(event, cx.canvas);
    // fileArray[nowFile][3].push(['Line', cx.lineWidth, cx.strokeStyle,[]])
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    pos = relativePos(event, cx.canvas);
    // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])

    cx.lineTo(pos.x, pos.y);
    cx.stroke();

    // fileArray[nowFile][3].push(['Line', cx.lineWidth, cx.strokeStyle, []])
    trackDrag(function(event) {
      cx.beginPath();
      cx.moveTo(pos.x, pos.y);
      // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
      pos = relativePos(event, cx.canvas);
      cx.lineTo(pos.x, pos.y);
      cx.stroke();
      // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    }, onEnd);
  }
};


// Ластик
tools.Erase = function(event, cx) {
  if(flag_for_bbrush){
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
  }else{
    cx.globalCompositeOperation = "destination-out";
    onEnd = function(){cx.globalCompositeOperation = "source-over";}
    cx.lineCap = "round";
    var pos = relativePos(event, cx.canvas);
    // fileArray[nowFile][3].push(['Erase', cx.lineWidth, cx.strokeStyle,[]])
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    pos = relativePos(event, cx.canvas);
    // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])

    cx.lineTo(pos.x, pos.y);
    cx.stroke();

    // fileArray[nowFile][3].push(['Erase', cx.lineWidth, cx.strokeStyle, []])
    trackDrag(function(event) {
      cx.beginPath();
      cx.moveTo(pos.x, pos.y);
      // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
      pos = relativePos(event, cx.canvas);
      cx.lineTo(pos.x, pos.y);
      cx.stroke();
      // fileArray[nowFile][3][fileArray[nowFile][3].length-1][3].push([pos.x, pos.y])
    }, onEnd);
  }
};

// Линия
tools.Line = function(event, linecx, onEnd) {
  if(flag_for_bbrush){
    var pos = relativePos(event, cx.canvas);
    linecx.canvas.width = cx.canvas.width
    linecx.canvas.height = cx.canvas.height

    linecx.lineWidth = cx.lineWidth
    linecx.strokeStyle = cx.strokeStyle
    linecx.fillStyle = cx.fillStyle

    linecx.lineCap = 'round'
    linecx.canvas.onmousemove = (e2) => {
      linecx.clearRect(0,0,cx.canvas.width, cx.canvas.height)

      linecx.beginPath()
      linecx.moveTo(pos.x, pos.y)
      linecx.lineTo(e2.offsetX, e2.offsetY)
      linecx.stroke()
        // cx.closePath()
      }
      linecx.canvas.onmouseup = (event) => {
        linecx.canvas.onmousemove = null;
        linecx.canvas.onmousedown = null;
        linecx.clearRect(0,0,cx.canvas.width, cx.canvas.height)
        linecx.beginPath()
        linecx.moveTo(pos.x, pos.y)
        linecx.lineTo(event.offsetX, event.offsetY)
        linecx.stroke()
        linecx.closePath()

        fileArray[nowFile][3].push(['Line', pos.x, pos.y, event.offsetX, event.offsetY, cx.lineWidth, cx.strokeStyle,])

        cx.drawImage(linecx.canvas,0,0,cx.canvas.width,cx.canvas.height)
        linecx.canvas.width = 0
        linecx.canvas.height = 0
      }
  }else{
    var pos = relativePos(event, cx.canvas);
    linecx.canvas.width = cx.canvas.width
    linecx.canvas.height = cx.canvas.height

    linecx.lineWidth = cx.lineWidth
    linecx.strokeStyle = cx.strokeStyle
    linecx.fillStyle = cx.fillStyle

    linecx.lineCap = 'round'
    linecx.canvas.onmousemove = (e2) => {
      linecx.clearRect(0,0,cx.canvas.width, cx.canvas.height)

      linecx.beginPath()
      linecx.moveTo(pos.x, pos.y)
      linecx.lineTo(e2.offsetX, e2.offsetY)
      linecx.stroke()
        // cx.closePath()
      }
      linecx.canvas.onmouseup = (event) => {
        linecx.canvas.onmousemove = null;
        linecx.canvas.onmousedown = null;
        linecx.clearRect(0,0,cx.canvas.width, cx.canvas.height)
        linecx.beginPath()
        linecx.moveTo(pos.x, pos.y)
        linecx.lineTo(event.offsetX, event.offsetY)
        linecx.stroke()
        linecx.closePath()

        blackcx.drawImage(linecx.canvas,0,0,cx.canvas.width,cx.canvas.height)
        linecx.canvas.width = 0
        linecx.canvas.height = 0
      }
  }

};



// Размер кисти
controls.brushSize = function(cx) {
  var select = elt("select", {class: `btn ${localTheme}btn`, id: "id_size"});
  var sizes = [5, 8, 12, 25, 35, 50, 75, 100, 150];
  sizes.forEach(function(size) {
    select.appendChild(elt("option", {value: size},
                           size + " px"));
  });
  // событие выбора
  select.addEventListener("change", function() {
    blackcx.lineWidth = select.value;
    cx.lineWidth = select.value;
    global_size = select.value;
    document.getElementById("id_size").blur();
  });
  return select;
};

// Цвет кисти
controls.pipe = function(cx) {
  let i = elt("i", {class:"fa fa-eyedropper"})
  var input = elt("button", {class: `btn ${localTheme}btn`, id:'id_pipe'},i);
  input.addEventListener("click", function() {
    if(countFile!=0){
      if(flag_for_pipe){ 
        document.getElementById('id_pipe').style = "color: white;"
        document.getElementById('id_pipe').style.removeProperty('color');
        document.getElementById('id_blackcanvas').style = 'pointer-events:all;'
        flag_for_pipe = false;}
      else{
        flag_for_pipe = true;
        document.getElementById('id_pipe').style = "color: grey;"
        document.getElementById('id_blackcanvas').style = 'pointer-events:none;'
        cx.canvas.onmousedown = (event) => {
          let rgb;
          let getI = cx.getImageData(event.offsetX, event.offsetY, 1,1).data;
          let getI2 = cx2.getImageData(event.offsetX, event.offsetY, 1,1).data;
          if(getI[0] == 0 && getI[1] == 0 && getI[2] == 0 && getI[3] == 0){
            rgb = [getI2[0], getI2[1], getI2[2]]
          }else{
            rgb = [getI[0], getI[1], getI[2]]
          }
          // console.log(rgb)
          cx.canvas.onmousedown = null;
          flag_for_pipe = false;
          for(i in dict){
            if((Math.abs(rgb[0] - dict[i][0]) <= 2) && (Math.abs(rgb[1] - dict[i][1]) <= 2) && (Math.abs(rgb[2] - dict[i][2]) <= 2)){
    
              cx.fillStyle = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;
              cx.strokeStyle = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;

              blackcx.fillStyle = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;
              blackcx.strokeStyle = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;

              global_color = `rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]})`;
              document.getElementById('id_color').value = i;
              break;
            }
          }
          document.getElementById('id_pipe').style = "color: white;"
          document.getElementById('id_pipe').style.removeProperty('color');
          document.getElementById('id_blackcanvas').style = 'pointer-events:all;'
        }
      }
    }
  });
  return input;
};

controls.color = function(cx) {
  var select = elt("select", {class: `btn ${localTheme}btn`, id:'id_color'});

  for(let i in dict){
    select.appendChild(elt("option", {value: i, style:`background: rgb(${dict[i][0]}, ${dict[i][1]}, ${dict[i][2]});`}, i));
  }

  select.addEventListener("change", function() {
    cx.fillStyle = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;
    cx.strokeStyle = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;

    blackcx.fillStyle = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;
    blackcx.strokeStyle = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;

    global_color = `rgb(${dict[select.value][0]}, ${dict[select.value][1]}, ${dict[select.value][2]})`;
    document.getElementById("id_color").blur();
  });
  return select;
};


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
          document.getElementById('id_shearscanvas').style.opacity = '50%';
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
              shears_json[fileArray[nowFile][0]].push([x1, y1, shearsWidth, shearsHeight])
              for(let i = 0;i<fileArrayOriginal.length;i++){
                if(fileArray[nowFile][0] == fileArrayOriginal[i][0]){
                  fileArrayOriginal[i][3].push(['Shears', x1, y1, shearsWidth, shearsHeight, color, size])
                }
              }

              flag_for_shears = false;
              document.getElementById('id_shears').style = "color: white;"
              document.getElementById('id_shears').style.removeProperty('color');

              let button = document.getElementById('id_mask2original')
              if(flag_for_eye){
                let i = elt('i', {class: 'fa fa-eye-slash'})
                button.textContent = ''
                button.appendChild(i)
                flag_for_eye = false;
                originalcx.canvas.width = 0;
                originalcx.canvas.height = 0;
              }
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
              shears_json[fileArray[nowFile][0]].push([x1, y1, shearsWidth, shearsHeight])
              flag_for_shears = false;
              for(let i = 0;i<fileArrayOriginal.length;i++){
                if(fileArray[nowFile][0] == fileArrayOriginal[i][0]){
                  fileArrayOriginal[i][3].push(['Shears', x1, y1, shearsWidth, shearsHeight, color, size])
                }
              }

              document.getElementById('id_shears').style.removeProperty('color');
              let button = document.getElementById('id_mask2original')
              if(flag_for_eye){
                let i = elt('i', {class: 'fa fa-eye-slash'})
                button.textContent = ''
                button.appendChild(i)
                flag_for_eye = false;
                originalcx.canvas.width = 0;
                originalcx.canvas.height = 0;
              }
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
        if(confirm("Холст будет очищен")){
          cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
          zoomcx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);

          let array_for_shears = [];
          for(let i=0;i<fileArray[nowFile][3].length;i++){
            if(fileArray[nowFile][3][i][0] == 'Shears'){
              array_for_shears.push(fileArray[nowFile][3][i])
            }
          }
          fileArray[nowFile][3] = array_for_shears;
        }
      }
    }
    link_new.addEventListener("click", clear);
    return link_new;
};




// Detail
controls.number = function(cx){
  var number_part = elt('span', {id: "id_number_part"}, `Деталь: `)
  return number_part;
}


// Black paint
controls.black_brush = function(cx){
  var brush = elt('button', {class: `btn ${localTheme}btn`, id: 'id_blackbrush'}, 'B')

  function bbrush(){
    if(flag_for_bbrush){
      blackcx.canvas.width = cx.canvas.width
      blackcx.canvas.height = cx.canvas.height
      blackcx.lineWidth = cx.lineWidth
      blackcx.strokeStyle = cx.strokeStyle
      blackcx.fillStyle = cx.fillStyle
      flag_for_bbrush = false
      document.getElementById('id_windowblackbrush').style.display = 'block'
      // document.getElementById('id_block_filebar').style.display = 'block'


      document.getElementById('id_readyblackbrush').onclick = () => {

      /////////////////////////////////////
      // алгоритм заменяет битые пиксели на нормальные
      var RAINBOW = cx.getImageData(0,0,cx.canvas.width,cx.canvas.height);
      var rc = RAINBOW.data
      // console.log([0,0,0] in dict2)
      for(let i = 0; i<rc.length;i+=4){
        let ourcolor = [rc[i], rc[i+1], rc[i+2]]
        let temp = [];
        if(!(ourcolor in dict2) || rc[i+3] != 255){

          if(rc[i] == 0 && rc[i+1] == 0 && rc[i+2] == 0) {rc[i+3] =0;continue;}

          // console.log(ourcolor, rc[i+3])



          // проверка правого пикселя на пригодность для замены

          // условие
          if([rc[i+4], rc[i+5], rc[i+6]] in dict2 && rc[i+7] == 255){
            temp.push([[rc[i+4], rc[i+5], rc[i+6]], dict2[[rc[i+4], rc[i+5], rc[i+6]]]])
            // console.log('right =', [[rc[i+4], rc[i+5], rc[i+6]], dict4[[rc[i+4], rc[i+5], rc[i+6]]]])
          }

          // проверка левого пикселя на пригодность для замены

          // условие
          if([rc[i-4], rc[i-3], rc[i-2]] in dict2 && rc[i-1] == 255){
            temp.push([[rc[i-4], rc[i-3], rc[i-2]], dict2[[rc[i-4], rc[i-3], rc[i-2]]]])
            // console.log('left =', [[rc[i-4], rc[i-3], rc[i-2]], dict4[[rc[i-4], rc[i-3], rc[i-2]]]])

          }

          // проверка верхнего пикселя на пригодность для замены

          // условие
          if([rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]] in dict2 && rc[i-(x*4)+3] == 255){
            temp.push([[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict2[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])
            // console.log('up =', [[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict4[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])

          }

          // проверка нижнего пикселя на пригодность для замены

          // условие
          if([rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]] in dict2 && rc[i+(x*4)+3] == 255){
            temp.push([[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict2[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])
            // console.log('down =', [[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict4[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])

          }
          // console.log(temp, rc[i+3])
          

          // поиск наиболее подходящего пикселя из всех возможных
          if(temp.length == 0){
            rc[i] = 0
            rc[i+1] = 0
            rc[i+2] = 0
            rc[i+3] = 0
          }else{
            let minabs = 999999999;
            let new_color;
            for(let j = 0;j<temp.length;j++){
              if(minabs > Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])){
                minabs = Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])
                new_color = temp[j][0];
                console.log(new_color)
              }
            }
            // console.log(new_color[0], ourcolor)
            // if(Number(new_color[0]) == 1){rc[i] = 0}
            // else{rc[i] = Number(new_color[0])}
            // rc[i+1] = 0
            // rc[i+2] = 0
            // rc[i+3] = 255
          // }
          }
        }
      }
      cx.putImageData(RAINBOW, 0, 0);
        ///////////////////////////////////


        
        var RAINBOW2 = cx2.getImageData(0,0,cx.canvas.width,cx.canvas.height);
        var RAINBOW1 = cx.getImageData(0,0,cx.canvas.width,cx.canvas.height);
        var RAINBOW3 = blackcx.getImageData(0,0,cx.canvas.width,cx.canvas.height);

        var rc1 = RAINBOW1.data
        var rc2 = RAINBOW2.data
        var rc3 = RAINBOW3.data
        for(let i = 0; i<rc1.length;i+=4){
          if((rc3[i] != 0 || rc3[i+1] != 0 || rc3[i+2] != 0 || rc3[i+3] != 0) && ((rc1[i] == 0 && rc1[i+1] == 0 && rc1[i+2] == 0 && rc1[i+3] == 255) || (rc2[i] == 0 && rc2[i+1] == 0 && rc2[i+2] == 0 && rc2[i+3] == 255))){
            rc1[i] = rc3[i];
            rc1[i+1] = rc3[i+1];
            rc1[i+2] = rc3[i+2];
            rc1[i+3] = rc3[i+3];
          }
        }
        cx.putImageData(RAINBOW1, 0, 0);

        fileArray[nowFile][3].push(['BBrush', RAINBOW1])

        blackcx.canvas.width = 0
        blackcx.canvas.height = 0
        flag_for_bbrush = true;
        document.getElementById('id_windowblackbrush').style.display = 'none'
        // document.getElementById('id_block_filebar').style.display = 'none'

      }
    }
    else{
      blackcx.canvas.width = 0
      blackcx.canvas.height = 0
      flag_for_bbrush = true;
      document.getElementById('id_windowblackbrush').style.display = 'none'
      // document.getElementById('id_block_filebar').style.display = 'none'

    }
  }


  brush.addEventListener('click', bbrush)
  return brush
}

// Color switch
controls.switchcolor = function(cx){
  var colorswitch = elt('button', {class: `btn ${localTheme}btn`, id: 'id_switchcolor'}, 'Замена');
  function switchcolor(){
    if(flag_for_switch){
      document.getElementById("id_windowswitch").style = 'display: none';
      flag_for_switch = false;
    }
    else{
        document.getElementById("id_windowswitch").style = 'display: block';
        document.addEventListener('click', (event) => {
          if(window.event.target.id == "id_switchcolor"){
          }else if(window.event.target.id != "id_windowswitch" && window.event.target.id != "id_exitswitch" && window.event.target.id != "id_firstcolor" && window.event.target.id != "id_secondcolor" && window.event.target.id != "id_textswitch")
            document.getElementById("id_windowswitch").style = 'display: none';
            flag_for_switch = false;
        })
        flag_for_switch = true;
        if(countFile != 0){
        let colorswitch = document.getElementById('id_exitswitch')
        colorswitch.addEventListener('click', ()=>{
          let color1 = dict[document.getElementById('id_firstcolor').value];
          let color2 = dict[document.getElementById('id_secondcolor').value];
          /////////////////////////////////////
      // алгоритм заменяет битые пиксели на нормальные
      var RAINBOW = cx.getImageData(0,0,cx.canvas.width,cx.canvas.height);
      var rc = RAINBOW.data
      // console.log([0,0,0] in dict2)
      for(let i = 0; i<rc.length;i+=4){
        let ourcolor = [rc[i], rc[i+1], rc[i+2]]
        let temp = [];
        if(!(ourcolor in dict2) || rc[i+3] != 255){

          if(rc[i] == 0 && rc[i+1] == 0 && rc[i+2] == 0) {rc[i+3] =0;continue;}

          // console.log(ourcolor, rc[i+3])



          // проверка правого пикселя на пригодность для замены

          // условие
          if([rc[i+4], rc[i+5], rc[i+6]] in dict2 && rc[i+7] == 255){
            temp.push([[rc[i+4], rc[i+5], rc[i+6]], dict2[[rc[i+4], rc[i+5], rc[i+6]]]])
            // console.log('right =', [[rc[i+4], rc[i+5], rc[i+6]], dict4[[rc[i+4], rc[i+5], rc[i+6]]]])
          }

          // проверка левого пикселя на пригодность для замены

          // условие
          if([rc[i-4], rc[i-3], rc[i-2]] in dict2 && rc[i-1] == 255){
            temp.push([[rc[i-4], rc[i-3], rc[i-2]], dict2[[rc[i-4], rc[i-3], rc[i-2]]]])
            // console.log('left =', [[rc[i-4], rc[i-3], rc[i-2]], dict4[[rc[i-4], rc[i-3], rc[i-2]]]])

          }

          // проверка верхнего пикселя на пригодность для замены

          // условие
          if([rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]] in dict2 && rc[i-(x*4)+3] == 255){
            temp.push([[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict2[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])
            // console.log('up =', [[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict4[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])

          }

          // проверка нижнего пикселя на пригодность для замены

          // условие
          if([rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]] in dict2 && rc[i+(x*4)+3] == 255){
            temp.push([[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict2[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])
            // console.log('down =', [[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict4[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])

          }
          // console.log(temp, rc[i+3])
          

          // поиск наиболее подходящего пикселя из всех возможных
          if(temp.length == 0){
            rc[i] = 0
            rc[i+1] = 0
            rc[i+2] = 0
            rc[i+3] = 0
          }else{
            let minabs = 999999999;
            let new_color;
            for(let j = 0;j<temp.length;j++){
              if(minabs > Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])){
                minabs = Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])
                new_color = temp[j][0];
              }
            }
          }
        }
      }
      cx.putImageData(RAINBOW, 0, 0);
        ///////////////////////////////////

          // var RAINBOWcx2 = cx2.getImageData(0,0,cx.canvas.width,cx.canvas.height);
          // var rc2 = RAINBOWcx2.data

          // var RAINBOW = cx.getImageData(0,0,x,y);
          // var rc = RAINBOW.data
          // var temp = {};
          // for(let i = 0; i<rc.length;i+=4){
          //   if(rc2[i] == 0 && rc2[i+1] == 0 && rc2[i+2] == 0){
          //     rc2[i+3] = 0;
          //   }else{
          //     rc2[i+3] = 255;
          //   }
          //   let colors = [rc[i], rc[i+1], rc[i+2]]
          //   if(colors in dict2){
          //     // pass
          //   }else{
          //     if(colors in temp){
          //       rc[i] = temp[colors][0]
          //       rc[i+1] = temp[colors][1]
          //       rc[i+2] = temp[colors][2]
          //       rc[i+3] = 255;
          //     }
          //     else{
          //       for(key in dict){
          //         if(Math.abs(colors[0] - dict[key][0]) <= 5 && Math.abs(colors[1] - dict[key][1]) <= 5 && Math.abs(colors[2] - dict[key][2]) <= 5){
          //           temp[colors] = dict[key]

          //           rc[i] = temp[colors][0]
          //           rc[i+1] = temp[colors][1]
          //           rc[i+2] = temp[colors][2]
          //           rc[i+3] = 255;
          //         }
          //         else{
          //           // console.log('bitii pixel ne popal')
          //         }
          //       }
          //     }
          //   }
          // }




          // cx2.putImageData(RAINBOWcx2, 0, 0);
          // cx.putImageData(RAINBOW, 0, 0);
          // var RAINBOW2 = RAINBOWcx2;
  

          // алгоритм меняет цвет на новый cx2
          var RAINBOW = cx2.getImageData(0,0,cx.canvas.width,cx.canvas.height);
          var rc = RAINBOW.data
          var RAINBOW2 = RAINBOW

          for(let i = 0; i<rc.length;i+=4){
            if(Math.abs(rc[i] - color1[0]) <= 0 && Math.abs(rc[i+1] - color1[1]) <= 0 && Math.abs(rc[i+2] - color1[2]) <= 0){
              if(color1[0] == 0 && color1[1] == 0 && color1[2] == 0 && rc[i+3] == 0){
                //skip
              }else{
                rc[i] = color2[0];
                rc[i+1] = color2[1];
                rc[i+2] = color2[2];
                rc[i+3] = 255;
              }
            }
          }
          cx2.putImageData(RAINBOW, 0, 0);

          // алгоритм меняет цвет на новый cx
          var RAINBOW = cx.getImageData(0,0,cx.canvas.width,cx.canvas.height);
          var rc = RAINBOW.data

          for(let i = 0; i<rc.length;i+=4){
            if(Math.abs(rc[i] - color1[0]) <= 0 && Math.abs(rc[i+1] - color1[1]) <= 0 && Math.abs(rc[i+2] - color1[2]) <= 0){
              if(color1[0] == 0 && color1[1] == 0 && color1[2] == 0 && rc[i+3] == 0){
                //skip
              }else{
                rc[i] = color2[0];
                rc[i+1] = color2[1];
                rc[i+2] = color2[2];
                rc[i+3] = 255;
              }
            }
          }
          cx.putImageData(RAINBOW, 0, 0);

          fileArray[nowFile][3].push(['Switch', RAINBOW, RAINBOW2]);
          document.getElementById("id_windowswitch").style = 'display: none';
        }) 
      }
    }
  }
  colorswitch.addEventListener('click', switchcolor)
  return colorswitch;
}

function checkorder(){
  for(let i=0; i<countFile; i++){
    // console.log(fileArray)
    // console.log(nowFile, countFile, fileArray_name)
    if(fileArrayOriginal_name.includes(fileArray[i][0])){

      document.getElementById(`id_filebar_a${i+1}`).textContent = '● ' + String("["+String(i+1)+"] " + fileArray[i][0]);
    }else{

      document.getElementById(`id_filebar_a${i+1}`).textContent = '○ ' + String("["+String(i+1)+"] " + fileArray[i][0]);
    }
  }
  if(countFile == 0){
    document.getElementById("id_text_upload_file1").style.display = 'block';
    document.getElementById("id_text_upload_file2").style.display = 'block';
    flag_for_remove_text = true;
  }
}

function remphoto(){
  if(confirm('Выбранное фото будет удалено.')){


       // удаление из локал стораджа
      //  console.log(nowFile)
      //  console.log(fileArray)
   
      //  let array = JSON.parse(localStorage.getItem('images'));
      //  let nametemp = fileArray[nowFile][0]
      //  for(let i=0;i<array.length;i++){
      //    if(nametemp == array[i][0]){
      //     //  console.log(i-1)
      //     //  console.log(array)
      //      array.splice(i,1)
   
      //      // console.log(array)
   
      //    }
      //  }
      //  localStorage.setItem('images', JSON.stringify(array))

    
    fileArray_name.splice(nowFile,1)
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

controls.mask2original = function(cx){
  let i = elt('i', {class: 'fa fa-eye-slash'})
  var button = elt('button', {class: `btn ${localTheme}btn`, id:'id_mask2original'}, i)
  let flag_for_eye = false;
  document.addEventListener('click', (event) => {
    if(window.event.target.id == "id_windowopacity" || window.event.target.id == "id_mask2original" || window.event.target.id == "id_inputopacity"){
      document.getElementById("id_windowopacity").style = 'display: block';
    }else{
      document.getElementById("id_windowopacity").style = 'display: none';
      flag_for_switch = false;
    }
  })
  // button.addEventListener('mouseup', function(event){
  //   document.getElementById('id_windowopacity').style.display = 'block';
  //   console.log(window.event.target.id)
  //   if(window.event.target.id == "id_windowopacity"){
  //   }else if(window.event.target.id != 'id_mask2original'){
  //     document.getElementById("id_windowopacity").style = 'display: none';
  //     flag_for_switch = false;
  //   }
  // }
  

  button.addEventListener('click', function(){
    if(flag_for_eye){
      let i = elt('i', {class: 'fa fa-eye-slash'})
      button.textContent = ''
      button.appendChild(i)
      flag_for_eye = false;
      originalcx.canvas.width = 0;
      originalcx.canvas.height = 0;

    }else{
      if(fileArrayOriginal_name.includes(fileArray[nowFile][0])){
        let i = elt('i', {class: 'fa fa-eye'})
        button.textContent = ''
        button.appendChild(i)
        flag_for_eye = true;
      
        originalfilebartocanvas(fileArray[nowFile][0]);
      }
      flag_for_eye = true;
    }

  })
  return button;
}
async function originalfilebartocanvas(name){
  for(let i=0;i<fileArrayOriginal.length;i++){
      if(name == fileArrayOriginal[i][0]){
          ourfile = fileArrayOriginal[i][2];
          break;
      }
  }

  var reader = new FileReader();
  await new Promise(resolve => {
    reader.readAsDataURL(ourfile);
    reader.onload = async function(){
        await originalloadImageURL(reader.result, name)
      resolve();
    };
  }).then();
  // console.log(fileArrayOriginal_commands)
}
async function originalloadImageURL(url, name) {

  await new Promise(resolve => {
    image.src = url;
    image.onload = function() {

      x = image.width;
      y = image.height;

      originalcx.canvas.width = x;
      originalcx.canvas.height = y;

      originalcx.drawImage(image,0,0,x,y);
      // console.log(fileArrayOriginal_commands[name][0])

      if(name in shears_json2){
        for(let i=0;i<shears_json2[name].length;i++){
          let x1 = shears_json2[name][i][0];
          let y1 = shears_json2[name][i][1];
          let shearsWidth = shears_json2[name][i][2];
          let shearsHeight = shears_json2[name][i][3];

          shearscx2.canvas.width = shearsWidth;
            shearscx2.canvas.height = shearsHeight;

            shearscx3.canvas.width = shearsWidth;
            shearscx3.canvas.height = shearsHeight; 


            shearscx2.drawImage(originalcx.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);

            originalcx.canvas.width = shearsWidth;
            originalcx.canvas.height = shearsHeight;

            originalcx.drawImage(shearscx2.canvas, 0,0,shearsWidth, shearsHeight)


            shearscx.canvas.width = 0;
            shearscx.canvas.height = 0;

            shearscx2.canvas.width = 0;
            shearscx2.canvas.height = 0;

            shearscx3.canvas.width = 0;
            shearscx3.canvas.height = 0;
        }
      }
      // console.log(fileArrayOriginal)
      for(let i=0;i<fileArrayOriginal.length; i++){
        if(fileArrayOriginal[i][0] == name){

          for(let j=0;j<fileArrayOriginal[i][3].length; j++){
            let x1 = fileArrayOriginal[i][3][j][1];
            let y1 = fileArrayOriginal[i][3][j][2];
            let shearsWidth = fileArrayOriginal[i][3][j][3];
            let shearsHeight = fileArrayOriginal[i][3][j][4];

            shearscx2.canvas.width = shearsWidth;
            shearscx2.canvas.height = shearsHeight;

            shearscx3.canvas.width = shearsWidth;
            shearscx3.canvas.height = shearsHeight; 


            shearscx2.drawImage(originalcx.canvas, x1, y1, shearsWidth, shearsHeight, 0, 0, shearsWidth,shearsHeight);

            originalcx.canvas.width = shearsWidth;
            originalcx.canvas.height = shearsHeight;

            originalcx.drawImage(shearscx2.canvas, 0,0,shearsWidth, shearsHeight)


            shearscx.canvas.width = 0;
            shearscx.canvas.height = 0;

            shearscx2.canvas.width = 0;
            shearscx2.canvas.height = 0;

            shearscx3.canvas.width = 0;
            shearscx3.canvas.height = 0;
          }
        }
      }
      resolve();
    };
  }).then();
}


// После нажатия на кнопку на Filebar срабаотывает эта функция, которая передает значения в loadImageURL()
async function filebartocanvas(name){

  //сохранение последнего фота
  // if(nowFile != -1 && nowFile != countFile){
    
  //   let array = JSON.parse(localStorage.getItem('images'));
  //   nametemp = fileArray[nowFile][0]
  //   for(let i=0;i<array.length;i++){
  //     if(nametemp == array[i][0]){
  //       array[i][3] = fileArray[nowFile][3]
  //     }
  //   }
  //   // localStorage.setItem('images', JSON.stringify(array))
  // }


  let i = elt('i', {class: 'fa fa-eye-slash'})
  document.getElementById('id_mask2original').textContent = ''
  document.getElementById('id_mask2original').appendChild(i)

  if(!(name in shears_json)){
    shears_json[name] = [];
  }
  flag_for_eye = false;
    originalcx.canvas.width = 0;
    originalcx.canvas.height = 0;
    shearscx.canvas.width = 0;
    shearscx.canvas.height = 0;
    blackcx.canvas.width = 0
    blackcx.canvas.height = 0
    // document.getElementById('id_block_filebar').style.display = 'none'
    document.getElementById('id_windowblackbrush').style.display = 'none'

    for(let i=0;i<countFile;i++){
        if(name == fileArray[i][0]){
            nowFile = i;
            // cx = fileArray[i][1];
            ourfile = fileArray[i][2];
            var commands = fileArray[i][3];
            var id = 'id_filebar_a' + String(i+1);
            break;
        }
    }
    for(let i=0;i<countFile;i++){
      // if(fileArray[i][1] == null){continue}
      document.getElementById('id_filebar_a' + String(i+1)).classList.remove('highlight')
    }

    var highlight = document.getElementById(id)
    highlight.classList.add('highlight')

    numberscroll=(nowFile)*40
    allfiles.scrollTo(0,numberscroll)

    if (typeof ourfile === 'string') {
      // this is a string

      await loadImageURL2(cx2, ourfile)
      await loadImageURL(cx, ourfile, commands, name);
      document.getElementById('id_canvas').style = 'display: block;';
      document.getElementById('id_canvas2').style = 'display: block;';

      // console.log('ffffffff')
    }else{
      var reader = new FileReader();
      await new Promise(resolve => {
        reader.readAsDataURL(ourfile);
        reader.onload = async function(){
            await loadImageURL2(cx2, reader.result)
            await loadImageURL(cx, reader.result, commands, name);
            document.getElementById('id_canvas').style = 'display: block;';
            document.getElementById('id_canvas2').style = 'display: block;';

          resolve();
        };
      }).then();
    }
    infobar.textContent = 'Файл: ' + name;
    cx.fillStyle = global_color;
    cx.strokeStyle =global_color;
    cx.lineWidth = global_size;

    // ZOOM

}


// Отрисовываем Canvas
var x;
var y;
async function loadImageURL(cx, url, commands, name) {

  await new Promise(resolve => {
    image.src = url;

    // let flag_for_localstorage = false;
    // let array = JSON.parse(localStorage.getItem('images'));

    // for(let i=0;i<array.length;i++){
    //   if(name == array[i][0]){
    //     flag_for_localstorage = true;
    //   }
    // }
    // if(!flag_for_localstorage){
    //   array.push([name, null, url, []])
    // }

    // localStorage.setItem('images', JSON.stringify(array))


    image.onload = function() {
      var color = cx.fillStyle, size = cx.lineWidth;
      ratio = image.height / image.width
      x = image.width;
      y = image.height;

      // if(x >= 1300){
      //   while(x >= 1300){
      //     x -= (x*1.1-x)
      //     y -= (y*1.1-y)
      //   }
      // }
      // if(y >= 610){
      //   while(y >= 610){
      //     x -= (x*1.1-x)
      //     y -= (y*1.1-y)
      //   }
      // }

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
            cx.lineWidth = commands[i][5];
            cx.strokeStyle = commands[i][6];
            cx.lineCap = "round";

            cx.beginPath()
            cx.moveTo(commands[i][1], commands[i][2])
            cx.lineTo(commands[i][3], commands[i][4])
            cx.stroke()
            cx.closePath()
          }
          if(commands[i][0] == 'BBrush'){
            cx.putImageData(commands[i][1],0,0)
          }
          if(commands[i][0] == 'Switch'){
            cx2.putImageData(commands[i][2], 0, 0)
            cx.putImageData(commands[i][1],0,0)
          }
          if(commands[i][0] == 'Brush'){
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

      document.getElementById('id_main').style.height = y+100+'px';

      cx3.canvas.width = x;
      cx3.canvas.height = y;

      cx3.drawImage(image,0,0,x,y);

      // с красного в цвета (машина)
        if(!flag_for_orig){
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
          }

      // if(x >= 1300){
      //   while(x >= 1300){
      //     x -= (x*1.1-x)
      //     y -= (y*1.1-y)
      //   }
      // }
      // if(y >= 610){
      //   while(y >= 610){
      //     x -= (x*1.1-x)
      //     y -= (y*1.1-y)
      //   }
      // }
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
  if (typeof ourfile === 'string') {
    // this is a string

    await secretloadImageURL(secretcx, ourfile, commands);

  }else{
    var reader = new FileReader();
    await new Promise(resolve => {
      reader.readAsDataURL(ourfile);
      reader.onload = async function(){

        await secretloadImageURL(secretcx, reader.result, commands);

        resolve();
      };
    }).then();
  }
}

// Отрисовываем Canvas
var x;
var y;
async function secretloadImageURL(secretcx, url, commands) {

await new Promise(resolve => {
  image.src = url;
  image.onload = function() {
    var color = secretcx.fillStyle, size = secretcx.lineWidth;
    ratio = image.height / image.width
    x = image.width;
    y = image.height;

    // if(x >= 1300){
    //   while(x >= 1300){
    //     x -= (x*1.1-x)
    //     y -= (y*1.1-y)
    //   }
    // }
    // if(y >= 610){
    //   while(y >= 610){
    //     x -= (x*1.1-x)
    //     y -= (y*1.1-y)
    //   }
    // }

    secretcx.canvas.width = x;
    secretcx.canvas.height = y;
    secretcx2.canvas.width = x;
    secretcx2.canvas.height = y;

    secretcx2.drawImage(image, 0,0, x,y);

    secretcx.fillStyle = color;
    secretcx.strokeStyle = color;
    secretcx.lineWidth = size;

    var fixlineWidth = secretcx.lineWidth
    var fixstrokeStyle = secretcx.strokeStyle
    secretcx.imageSmoothingEnabled = false;
    
    for(let i=0; i<commands.length; i++){
      if(commands[i][0] == 'Line'){
        secretcx.lineWidth = commands[i][5];
        secretcx.strokeStyle = commands[i][6];
        secretcx.lineCap = "round";

        secretcx.beginPath()
        secretcx.moveTo(commands[i][1], commands[i][2])
        secretcx.lineTo(commands[i][3], commands[i][4])
        secretcx.stroke()
        secretcx.closePath()
      }
      if(commands[i][0] == 'BBrush'){
        secretcx.putImageData(commands[i][1],0,0)
      }
      if(commands[i][0] == 'Switch'){
        secretcx2.putImageData(commands[i][2], 0, 0)
        secretcx.putImageData(commands[i][1],0,0)
      }
      if(commands[i][0] == 'Brush'){
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
        /////////////////////////////////////
      // алгоритм заменяет битые пиксели на нормальные
      var RAINBOW = secretcx.getImageData(0,0,secretcx.canvas.width,secretcx.canvas.height);
      var rc = RAINBOW.data
      // console.log([0,0,0] in dict2)
      for(let i = 0; i<rc.length;i+=4){
        let ourcolor = [rc[i], rc[i+1], rc[i+2]]
        let temp = [];
        if(!(ourcolor in dict2) || rc[i+3] != 255){

          if(rc[i] == 0 && rc[i+1] == 0 && rc[i+2] == 0) {rc[i+3] =0;continue;}

          // console.log(ourcolor, rc[i+3])



          // проверка правого пикселя на пригодность для замены

          // условие
          if([rc[i+4], rc[i+5], rc[i+6]] in dict2 && rc[i+7] == 255){
            temp.push([[rc[i+4], rc[i+5], rc[i+6]], dict2[[rc[i+4], rc[i+5], rc[i+6]]]])
            // console.log('right =', [[rc[i+4], rc[i+5], rc[i+6]], dict4[[rc[i+4], rc[i+5], rc[i+6]]]])
          }

          // проверка левого пикселя на пригодность для замены

          // условие
          if([rc[i-4], rc[i-3], rc[i-2]] in dict2 && rc[i-1] == 255){
            temp.push([[rc[i-4], rc[i-3], rc[i-2]], dict2[[rc[i-4], rc[i-3], rc[i-2]]]])
            // console.log('left =', [[rc[i-4], rc[i-3], rc[i-2]], dict4[[rc[i-4], rc[i-3], rc[i-2]]]])

          }

          // проверка верхнего пикселя на пригодность для замены

          // условие
          if([rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]] in dict2 && rc[i-(x*4)+3] == 255){
            temp.push([[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict2[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])
            // console.log('up =', [[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict4[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])

          }

          // проверка нижнего пикселя на пригодность для замены

          // условие
          if([rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]] in dict2 && rc[i+(x*4)+3] == 255){
            temp.push([[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict2[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])
            // console.log('down =', [[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict4[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])

          }
          // console.log(temp, rc[i+3])
          

          // поиск наиболее подходящего пикселя из всех возможных
          if(temp.length == 0){
            rc[i] = 0
            rc[i+1] = 0
            rc[i+2] = 0
            rc[i+3] = 0
          }else{
            let minabs = 999999999;
            let new_color;
            for(let j = 0;j<temp.length;j++){
              if(minabs > Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])){
                minabs = Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])
                new_color = temp[j][0];
              }
            }
            // console.log(new_color[0], ourcolor)
            // if(Number(new_color[0]) == 1){rc[i] = 0}
            // else{rc[i] = Number(new_color[0])}
            // rc[i+1] = 0
            // rc[i+2] = 0
            // rc[i+3] = 255
          // }
          }
        }
      }
      secretcx.putImageData(RAINBOW, 0, 0);
        ///////////////////////////////////

    // // алгоритм заменяет все цвета машины на красные cx2
    //   var RAINBOW = secretcx2.getImageData(0,0,x,y);
    //   var rainbowColors = RAINBOW.data
    //   for(let i = 0; i<rainbowColors.length;i+=4){
    //     let ourcolor = [rainbowColors[i], rainbowColors[i+1], rainbowColors[i+2]]
    //     if(ourcolor in dict2){
    //       let number = ourcolor;
    //       if(Number(dict2[number]) == 1){rainbowColors[i] = 0}
    //       else{rainbowColors[i] = Number(dict2[number])}
    //       rainbowColors[i+1] = 0;
    //       rainbowColors[i+2] = 0;
    //       rainbowColors[i+3] = 255;
    //     }
    //   }
    //   secretcx2.putImageData(RAINBOW, 0, 0);
    //   // алгоритм заменяет все цвета на красные cx
    //   var RAINBOW = secretcx.getImageData(0,0,x,y);
    //   var rainbowColors = RAINBOW.data
    //   for(let i = 0; i<rainbowColors.length;i+=4){
    //     let ourcolor = [rainbowColors[i], rainbowColors[i+1], rainbowColors[i+2]]
    //     // console.log(ourcolor)
    //     if(ourcolor in dict2 && dict2[ourcolor] != "1"){
    //       let number = ourcolor;
    //       if(Number(dict2[number]) == 1){rainbowColors[i] = 0}
    //       else{rainbowColors[i] = Number(dict2[number])}
    //       rainbowColors[i+1] = 0;
    //       rainbowColors[i+2] = 0;
    //       rainbowColors[i+3] = 255;
    //     }
    //   }
    //   secretcx.putImageData(RAINBOW, 0, 0);


      // алгоритм заменяет все цвета машины на красные cx2
      var RAINBOW2 = secretcx2.getImageData(0,0,x,y);
      var rainbowColors2 = RAINBOW2.data

      var RAINBOW = secretcx.getImageData(0,0,x,y);
      var rainbowColors = RAINBOW.data

      for(let i = 0; i<rainbowColors2.length;i+=4){
        let ourcolor2 = [rainbowColors2[i], rainbowColors2[i+1], rainbowColors2[i+2]]

        let ourcolor = [rainbowColors[i], rainbowColors[i+1], rainbowColors[i+2]]

        if(ourcolor2 in dict2){
          let number2 = ourcolor2;
          if(Number(dict2[number2]) == 1){rainbowColors2[i] = 0}
          else{rainbowColors2[i] = Number(dict2[number2])}
          rainbowColors2[i+1] = 0;
          rainbowColors2[i+2] = 0;
          rainbowColors2[i+3] = 255;
        }
        if(ourcolor in dict2 && dict2[ourcolor] != "1"){
          let number = ourcolor;
          if(Number(dict2[number]) == 1){rainbowColors[i] = 0}
          else{rainbowColors[i] = Number(dict2[number])}
          rainbowColors[i+1] = 0;
          rainbowColors[i+2] = 0;
          rainbowColors[i+3] = 255;
        }
      }
      secretcx.putImageData(RAINBOW, 0, 0);
      secretcx2.putImageData(RAINBOW2, 0, 0);






      // алгоритм заменяет битые пиксели на нормальные
      var RAINBOW = secretcx.getImageData(0,0,x,y);
      var rc = RAINBOW.data
      
      for(let i = 0; i<rc.length;i+=4){
        let ourcolor = [rc[i], rc[i+1], rc[i+2]]
        let temp = [];

        if(!(ourcolor in dict4) || rc[i+3] != 255){
          if(rc[i] == 0 && rc[i+1] == 0 && rc[i+2] == 0) continue;
          if(ourcolor in dict4 && rc[i+3] == 255) continue;

          // console.log(ourcolor, rc[i+3])



          // проверка правого пикселя на пригодность для замены

          // условие
          if([rc[i+4], rc[i+5], rc[i+6]] in dict4 && rc[i+7] == 255){
            temp.push([[rc[i+4], rc[i+5], rc[i+6]], dict4[[rc[i+4], rc[i+5], rc[i+6]]]])
            // console.log('right =', [[rc[i+4], rc[i+5], rc[i+6]], dict4[[rc[i+4], rc[i+5], rc[i+6]]]])
          }

          // проверка левого пикселя на пригодность для замены

          // условие
          if([rc[i-4], rc[i-3], rc[i-2]] in dict4 && rc[i-1] == 255){
            temp.push([[rc[i-4], rc[i-3], rc[i-2]], dict4[[rc[i-4], rc[i-3], rc[i-2]]]])
            // console.log('left =', [[rc[i-4], rc[i-3], rc[i-2]], dict4[[rc[i-4], rc[i-3], rc[i-2]]]])

          }

          // проверка верхнего пикселя на пригодность для замены

          // условие
          if([rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]] in dict4 && rc[i-(x*4)+3] == 255){
            temp.push([[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict4[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])
            // console.log('up =', [[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]], dict4[[rc[i-(x*4)], rc[i-(x*4)+1], rc[i-(x*4)+2]]]])

          }

          // проверка нижнего пикселя на пригодность для замены

          // условие
          if([rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]] in dict4 && rc[i+(x*4)+3] == 255){
            temp.push([[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict4[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])
            // console.log('down =', [[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]], dict4[[rc[i+(x*4)], rc[i+(x*4)+1], rc[i+(x*4)+2]]]])

          }
          // console.log(temp, rc[i+3])
          

          // поиск наиболее подходящего пикселя из всех возможных
          if(temp.length == 0){
            rc[i] = 0
            rc[i+1] = 0
            rc[i+2] = 0
            rc[i+3] = 0
          }else{
            let minabs = 999999999;
            let new_color;
            for(let j = 0;j<temp.length;j++){
              if(minabs > Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])){
                minabs = Math.abs(rc[i]-temp[j][1][0]) + Math.abs(rc[i+1]-temp[j][1][1]) + Math.abs(rc[i+2]-temp[j][1][2])
                new_color = temp[j][0];
                // console.log(new_color)
              }
            }
            // console.log(new_color[0], ourcolor)
            if(Number(new_color[0]) == 1){rc[i] = 0}
            else{rc[i] = Number(new_color[0])}
            rc[i+1] = 0
            rc[i+2] = 0
            rc[i+3] = 255
          // }
          }
        }
      }
      secretcx.putImageData(RAINBOW, 0, 0);




    secretcx3.canvas.width = x;
    secretcx3.canvas.height = y;
    secretcx3.imageSmoothingEnabled = false;
    secretcx3.drawImage(secretcx2.canvas,0,0,x,y);
    secretcx3.imageSmoothingEnabled = false;
    secretcx3.drawImage(secretcx.canvas,0,0,x,y);
    secretcx3.imageSmoothingEnabled = false;


   
    resolve();
  };
}).then();
}


controls.save = function(cx) {
  var link = elt("button", {class: `${localTheme}btn`, id: "id_save"}, "Сохранить");
  async function download() {

    if(countFile != 0){
      document.getElementById('id_secretcanvas').style = 'display: none;'
      document.getElementById('id_windowprogressbar').style.display = 'block';
      document.getElementById('id_progressbar').max = countFile;

        var zip = new JSZip();
        let fornowFile = nowFile;
        for(let i=0;i<countFile;i++){
          document.getElementById('id_progress_text').textContent = `Скачивание файлов: ${i}/${countFile}`;
          let filename = fileArray[i][0];
          await secretfilebartocanvas(fileArray[i][0]);
          zip.file(`${filename}`, dataURLtoBlob(secretcx3.canvas.toDataURL()));

          secretcx.canvas.width = 0;
          secretcx.canvas.height = 0;

          secretcx2.canvas.width = 0;
          secretcx2.canvas.height = 0;
          
          secretcx3.canvas.width = 0;
          secretcx3.canvas.height = 0;
          document.getElementById('id_progressbar').value = i+1;
        }
        // console.log(shears_json)
        for(key in shears_json){
          // console.log(shears_json[key])
          if(shears_json[key].length == 0){
            delete shears_json[key];
          }
        }
        zip.file('mask.json', JSON.stringify(shears_json))
        zip.generateAsync({type:'blob'})
        .then((content) => {
          saveAs(content, 'out.zip')
        })
        filebartocanvas(fileArray[fornowFile][0])
        
      
      // console.log('done')
      document.getElementById('id_windowprogressbar').style.display = 'none';
      document.getElementById('id_progressbar').max = 0;
      document.getElementById('id_progressbar').value = 0;



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
    if(evtobj.keyCode == 0 || evtobj.keyCode == 32){
      let button = document.getElementById('id_mask2original')
      if(flag_for_eye){
        let i = elt('i', {class: 'fa fa-eye-slash'})
        button.textContent = ''
        button.appendChild(i)
        flag_for_eye = false;
        originalcx.canvas.width = 0;
        originalcx.canvas.height = 0;
        
      }else{
        if(fileArrayOriginal_name.includes(fileArray[nowFile][0])){
          let i = elt('i', {class: 'fa fa-eye'})
          button.textContent = ''
          button.appendChild(i)
          flag_for_eye = true;
        
          originalfilebartocanvas(fileArray[nowFile][0]);
        }
        flag_for_eye = true;
      }  
      e.preventDefault();
    }
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
      
      if(fileArray[nowFile][3][fileArray[nowFile][3].length-1][0] == 'Brush' || fileArray[nowFile][3][fileArray[nowFile][3].length-1][0] == 'Erase'){
      
        fileArray[nowFile][3].pop();
        fileArray[nowFile][3].pop();
      }else{
        fileArray[nowFile][3].pop();

        for(let i = 0;i<fileArrayOriginal.length;i++){
          if(fileArrayOriginal[i][0] == fileArray[nowFile][0]){
            fileArrayOriginal[i][3].pop()
          }
        }
      }
      shears_json[fileArray[nowFile][0]].pop()
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
    if(evtobj.keyCode == 88){
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
              shears_json[fileArray[nowFile][0]].push([x1, y1, shearsWidth, shearsHeight])
              for(let i = 0;i<fileArrayOriginal.length;i++){
                if(fileArray[nowFile][0] == fileArrayOriginal[i][0]){
                  fileArrayOriginal[i][3].push(['Shears', x1, y1, shearsWidth, shearsHeight, color, size])
                }
              }

              flag_for_shears = false;
              document.getElementById('id_shears').style = "color: white;"
              document.getElementById('id_shears').style.removeProperty('color');
              let button = document.getElementById('id_mask2original')
              if(flag_for_eye){
                let i = elt('i', {class: 'fa fa-eye-slash'})
                button.textContent = ''
                button.appendChild(i)
                flag_for_eye = false;
                originalcx.canvas.width = 0;
                originalcx.canvas.height = 0;
              }
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
              shears_json[fileArray[nowFile][0]].push([x1, y1, shearsWidth, shearsHeight])
              for(let i = 0;i<fileArrayOriginal.length;i++){
                if(fileArray[nowFile][0] == fileArrayOriginal[i][0]){
                  fileArrayOriginal[i][3].push(['Shears', x1, y1, shearsWidth, shearsHeight, color, size])
                }
              }
              flag_for_shears = false;
              document.getElementById('id_shears').style.removeProperty('color');
              let button = document.getElementById('id_mask2original')
              if(flag_for_eye){
                let i = elt('i', {class: 'fa fa-eye-slash'})
                button.textContent = ''
                button.appendChild(i)
                flag_for_eye = false;
                originalcx.canvas.width = 0;
                originalcx.canvas.height = 0;
              }
            }

          }
        }
      }
    }
    if(evtobj.keyCode == 67){if(countFile!=0){
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
    }}
    if(evtobj.keyCode == 66){
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

    if(evtobj.keyCode == 69){
      if(countFile != 0){
        if(document.getElementById('id_tool').value == "Кисть"){
          document.getElementById('id_tool').value = "Ластик"
        }else if(document.getElementById('id_tool').value == "Ластик"){
          document.getElementById('id_tool').value = "Линия";
        }else{
          document.getElementById('id_tool').value = "Кисть";
        }
      }
    }

    if(evtobj.keyCode == 78){
      if(countFile != 0){
        if(flag_for_bbrush){
          blackcx.canvas.width = cx.canvas.width
          blackcx.canvas.height = cx.canvas.height
          blackcx.lineWidth = cx.lineWidth
          blackcx.strokeStyle = cx.strokeStyle
          blackcx.fillStyle = cx.fillStyle
          flag_for_bbrush = false
          document.getElementById('id_windowblackbrush').style.display = 'block'
          // document.getElementById('id_block_filebar').style.display = 'block'
    
    
          document.getElementById('id_readyblackbrush').onclick = () => {
            
            
            var RAINBOW2 = cx2.getImageData(0,0,cx.canvas.width,cx.canvas.height);
            var RAINBOW1 = cx.getImageData(0,0,cx.canvas.width,cx.canvas.height);
            var RAINBOW3 = blackcx.getImageData(0,0,cx.canvas.width,cx.canvas.height);
    
            var rc1 = RAINBOW1.data
            var rc2 = RAINBOW2.data
            var rc3 = RAINBOW3.data
    
            // console.log(rc2)
            for(let i = 0; i<rc1.length;i+=4){
              if((rc3[i] != 0 || rc3[i+1] != 0 || rc3[i+2] != 0 || rc3[i+3] != 0) && ((rc1[i] == 0 && rc1[i+1] == 0 && rc1[i+2] == 0 && rc1[i+3] == 255) || (rc2[i] == 0 && rc2[i+1] == 0 && rc2[i+2] == 0 && rc2[i+3] == 255))){
                rc1[i] = rc3[i];
                rc1[i+1] = rc3[i+1];
                rc1[i+2] = rc3[i+2];
                rc1[i+3] = rc3[i+3];
                // console.log('it work')
              }
            }
            cx.putImageData(RAINBOW1, 0, 0);
    
            fileArray[nowFile][3].push(['BBrush', RAINBOW1])
    
            blackcx.canvas.width = 0
            blackcx.canvas.height = 0
            flag_for_bbrush = true;
            document.getElementById('id_windowblackbrush').style.display = 'none'
            // document.getElementById('id_block_filebar').style.display = 'none'
    
          }
        }
        else{
          blackcx.canvas.width = 0
          blackcx.canvas.height = 0
          flag_for_bbrush = true;
          document.getElementById('id_windowblackbrush').style.display = 'none'
          // document.getElementById('id_block_filebar').style.display = 'none'
    
        }
      }
    }
    if(evtobj.keyCode == 67){}
    if(evtobj.keyCode == 67){}


}       
document.onkeydown = KeyPress;

// Смена темы
controls.theme = function(cx) {
    var new_theme = elt("select", {class: `${localTheme}btn`, id:'id_theme'});
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
        document.getElementById('id_windowswitch').classList.remove('darkToolFileFooterbar')
        document.getElementById('id_windowswitch').classList.add('lightToolFileFooterbar')
        document.getElementById('id_windowblackbrush').classList.remove('darkToolFileFooterbar')
        document.getElementById('id_windowblackbrush').classList.add('lightToolFileFooterbar')
        document.getElementById('id_windowopacity').classList.remove('darkToolFileFooterbar')
        document.getElementById('id_windowopacity').classList.add('lightToolFileFooterbar')

        // Buttons

        document.getElementById('id_readyblackbrush').classList.remove('darkbtn')
        document.getElementById('id_readyblackbrush').classList.add('lightbtn')

        document.getElementById('id_blackbrush').classList.remove('darkbtn')
        document.getElementById('id_blackbrush').classList.add('lightbtn')

        document.getElementById('id_buttonALLREM').classList.remove('darkbtn')
        document.getElementById('id_buttonALLREM').classList.add('lightbtn')

        document.getElementById('id_file-upload2').classList.remove('darkbtn')
        document.getElementById('id_file-upload2').classList.add('lightbtn')

        document.getElementById('id_mask2original').classList.remove('darkbtn')
        document.getElementById('id_mask2original').classList.add('lightbtn')

        document.getElementById('id_firstcolor').classList.remove('darkbtn')
        document.getElementById('id_firstcolor').classList.add('lightbtn')

        document.getElementById('id_secondcolor').classList.remove('darkbtn')
        document.getElementById('id_secondcolor').classList.add('lightbtn')

        document.getElementById('id_exitswitch').classList.remove('darkbtn')
        document.getElementById('id_exitswitch').classList.add('lightbtn')

        document.getElementById('id_switchcolor').classList.add('lightbtn')
        document.getElementById('id_switchcolor').classList.remove('darkbtn')

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
        document.getElementById('id_windowswitch').classList.remove('lightToolFileFooterbar')
        document.getElementById('id_windowswitch').classList.add('darkToolFileFooterbar')
        document.getElementById('id_windowblackbrush').classList.remove('lightToolFileFooterbar')
        document.getElementById('id_windowblackbrush').classList.add('darkToolFileFooterbar')
        document.getElementById('id_windowopacity').classList.remove('lightToolFileFooterbar')
        document.getElementById('id_windowopacity').classList.add('darkToolFileFooterbar')

        // Buttons
        document.getElementById('id_readyblackbrush').classList.remove('lightbtn')
        document.getElementById('id_readyblackbrush').classList.add('darkbtn')

        document.getElementById('id_blackbrush').classList.remove('lightbtn')
        document.getElementById('id_blackbrush').classList.add('darkbtn')

        document.getElementById('id_buttonALLREM').classList.remove('lightbtn')
        document.getElementById('id_buttonALLREM').classList.add('darkbtn')

        document.getElementById('id_file-upload2').classList.remove('lightbtn')
        document.getElementById('id_file-upload2').classList.add('darkbtn')

        document.getElementById('id_mask2original').classList.remove('lightbtn')
        document.getElementById('id_mask2original').classList.add('darkbtn')

        document.getElementById('id_firstcolor').classList.remove('lightbtn')
        document.getElementById('id_firstcolor').classList.add('darkbtn')

        document.getElementById('id_secondcolor').classList.remove('lightbtn')
        document.getElementById('id_secondcolor').classList.add('darkbtn')

        document.getElementById('id_exitswitch').classList.remove('lightbtn')
        document.getElementById('id_exitswitch').classList.add('darkbtn')

        document.getElementById('id_switchcolor').classList.remove('lightbtn')
        document.getElementById('id_switchcolor').classList.add('darkbtn')

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
