//不同宽度的线
//全局反走样开启或者关闭
//采用羽化的方式专门进行反走样

var line_vs = `
attribute vec4 a_Pos;
attribute vec4 a_color;
varying vec4 v_color;


void main (){
    gl_Position = a_Pos;
    v_color = a_color;
}`;

//uniform vec4 u_Color;

var line_fs = `
precision mediump float;
varying vec4 v_color;
void main(){
    gl_FragColor = v_color;
}`




function getWebglEle(isanitialiased){
    const canvas = document.getElementById("webgl");
    const gl = canvas.getContext('webgl', {antialias: isanitialiased});
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl;
}

// Param:
// @ coordinate : Array of THREE.Vector3
// @ color : Array of Color
// @ drawType : gl.triangle of gl.triangle_strip
// Returens : void
function drawlineSequence(gl , coordinate, color, drawType){

    const program = createProgram(gl, line_vs, line_fs);

    gl.useProgram(program.program);

    const aLine = [];
    coordinate.forEach((item) => {
       aLine.push(item.x, item.y, item.z);
    });
    // Assume the length of coordinate equals to the length of color
    const colorArr = [];
    color.forEach((item) => {
       colorArr.push(item.r, item.g, item.b, item.alpha);
    });

    var colorbuff = createBuffer(gl, new Float32Array(colorArr));
    bindAttribute(gl, colorbuff, program.a_color, 4);

    var lineBuffer = createBuffer(gl, new Float32Array(aLine));
    bindAttribute(gl, lineBuffer, program.a_Pos, 3);

    var n = coordinate.length;
    console.log(gl.TRIANGLES)
    gl.drawArrays(drawType,0,n);
    /*
    for(var i = 0; i<20; i++){
        var lineWidth = (0.1+0.3*i)*transform();
        var arr = spliteALine(aLine,lineWidth);
        arr = changeToStrip(arr.left,arr.right);
        u_translate = new THREE.Matrix4();
        u_translate.makeTranslation(deltax,0,0);
        gl.uniformMatrix4fv(program.u_translate, false, new Float32Array(u_translate.elements));  
        bindAttribute(gl, lineBuffer, program.a_Pos, 2);
    
        var lineBuffer = createBuffer(gl, new Float32Array(arr));
        var n = arr.length / 2;
    
        var deltax = 0.1*i;
        let u_translate = new THREE.Matrix4();
        u_translate.makeTranslation(deltax,0,0);
        gl.uniformMatrix4fv(program.u_translate, false, new Float32Array(u_translate.elements));  
        bindAttribute(gl, lineBuffer, program.a_Pos, 2);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,n);
    }
     */
}

function drawFeatherLine(){
    var gl = getContextgl();

    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var program = createProgram(gl, line_vs, line_fs);
    gl.useProgram(program.program);


    //绘制未经过处理的线
    var aLine = [-0.6,0.9,-0.9,0.2];
    var colorArr = [];
    for (let i =0; i<aLine.length/2; i++){
        colorArr = colorArr.concat([0,0,0,1]);
    }
    var u_translate = new THREE.Matrix4();
    u_translate.makeTranslation(-0.1,0,0);
    gl.uniformMatrix4fv(program.u_translate, false, new Float32Array(u_translate.elements)); 
    // gl.uniform1i(program.u_iscahngecolor, 0);
    var colorbuff = createBuffer(gl, new Float32Array(colorArr));
    var lineBuffer = createBuffer(gl, new Float32Array(aLine));
    bindAttribute(gl, lineBuffer, program.a_Pos, 2);
    bindAttribute(gl, colorbuff, program.a_color, 4);
    var n = aLine.length / 2;
    gl.drawArrays(gl.LINES,0,n);

    for(var i = 0; i<20; i++){
        var lineWidth = (0.1+0.3*i)*transform();
        var arr = spliteALine(aLine,lineWidth);
        var arr1 = spliteALine(aLine,lineWidth/2+lineWidth);

        var leftFeather = addColortoFeatherVertex(arr.left,arr1.left);
        var rightFeather = addColortoFeatherVertex(arr.right,arr1.right);

        var u_translate = new THREE.Matrix4();
        var deltax = 0.1*i
        u_translate.makeTranslation(deltax,0,0);
        gl.uniformMatrix4fv(program.u_translate, false, new Float32Array(u_translate.elements)); 

        //绘制中心线
        var arr3 = changeToStrip(arr.left,arr.right);
        var lineBuffer = createBuffer(gl, new Float32Array(arr3));
        for (let i =0; i<arr3.length/2; i++){
            colorArr = colorArr.concat([0,0,0,1]);
        }    

        //绘制左边的羽化部分
        var lineBuffer = createBuffer(gl, new Float32Array(leftFeather.triangleStrip));
        var num = leftFeather.triangleStrip.length / 2;
        var colorBuffer = createBuffer(gl, new Float32Array(leftFeather.colorArr));
        bindAttribute(gl, colorBuffer, program.a_color,4);
        bindAttribute(gl, lineBuffer, program.a_Pos, 2);
        gl.drawArrays(gl.TRIANGLES,0,num);

        //绘制右边的羽化部分
        colorBuffer = createBuffer(gl, new Float32Array(rightFeather.colorArr));
        bindAttribute(gl, colorBuffer, program.a_color,4);
        lineBuffer = createBuffer(gl, new Float32Array(rightFeather.triangleStrip));
        bindAttribute(gl, lineBuffer, program.a_Pos, 2);
        gl.drawArrays(gl.TRIANGLES,0,num);
    }

}

//把一条线段拆分成两个三角形
function spliteALine(segment,lineWidth){
    let line = pointToVec(segment);
    let v1 = new THREE.Vector2();

    v1.subVectors(line[1],line[0]);
    v1.normalize();
    let miter = new THREE.Vector2(-v1.y, v1.x);


    let pt1,pt2,pt3, pt4;
    
    pt1 = getXY(miter,line[0],lineWidth);
    pt2 = getXY(miter.negate(),line[0],lineWidth);

    pt3 = getXY(miter,line[1],lineWidth);
    pt4 = getXY(miter.negate(),line[1],lineWidth);
    
    let triStrip = {};
    triStrip.left = [pt1,pt3];
    triStrip.right = [pt2,pt4];
    // triStrip = toXYArray(triStrip);

    return triStrip;
}

function changeToStrip(left, right){
    return toXYArray([right[0], left[0],left[1],right[1]]);
} 
