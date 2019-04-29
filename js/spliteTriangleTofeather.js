var v_feather = `
attribute vec4 a_triPos;
attribute vec4 a_color;
varying vec4 v_color;
void main (){
gl_Position = a_triPos;
v_color = a_color;

}`;

var f_feather = `
precision mediump float;
varying vec4 v_color;
void main (){
    gl_FragColor = v_color;
    
}`;


//斜角的反走样
function spliteTriangle(guiObj,originData){
    var pointsCoor = [];
    var originCoor = getCoorVector2(originData);
    var lineWidth = transform() * guiObj.width;

    pointsCoor = splitePolyline(originData,0.1);
    var insertCoor = insertPoints(pointsCoor,lineWidth,guiObj.gradient);

    var twoTiangleStrip = getTwoTriangleStrip(insertCoor, pointsCoor);
    drawTwinLine(twoTiangleStrip,guiObj);
    
    // function getTwoTriangleStrip(pointsCoor,  originCoor){
    //     var TriStrip1 = [];
    //     var TriStrip2 = [];
    //     var color1 = [0,0,0.8,0.3];
    //     var color2 = [0,0,0.8,0.8];
    //     var color_left = [];
    //     //var color_right = [];
    //     var len = originCoor.length;

    //     for (var i =0; i<len-1; i++){
    //         //折线段左边的三角形条带
    //         TriStrip1.push(pointsCoor[0][i]);
    //         color_left = color_left.concat(color1);

    //         TriStrip1.push(originCoor[i]);
    //         color_left = color_left.concat(color2);

    //         TriStrip1.push(pointsCoor[0][i+1]);
    //         color_left = color_left.concat(color1);

    //         TriStrip1.push(originCoor[i]);
    //         color_left = color_left.concat(color2);

    //         TriStrip1.push(originCoor[i+1]);
    //         color_left = color_left.concat(color2);

    //         TriStrip1.push(pointsCoor[0][i+1]);
    //         color_left = color_left.concat(color1);


    //         //右边的三角形条带
    //         TriStrip2.push(pointsCoor[1][i]);
    //         TriStrip2.push(originCoor[i]);
    //         TriStrip2.push(pointsCoor[1][i+1]);

    //         TriStrip2.push(originCoor[i]);
    //         TriStrip2.push(originCoor[i+1]);
    //         TriStrip2.push(pointsCoor[1][i+1]);
    //     }

    //     // var strip1 = convertCor(TriStrip1,boundary);
    //     // var strip2 = convertCor(TriStrip2,boundary);

    //     var allTriangles = TriStrip1.concat(TriStrip2);
    //     allTriangles = toXYArray(allTriangles);
    //     var color = color_left.concat(color_left);//左右两边的颜色序列一致
    //     var allTriangles_Clr = [];
    //     allTriangles_Clr.push(allTriangles);
    //     allTriangles_Clr.push(color);

    //     // console.log(allTriangles_Clr);
        
    //     return allTriangles_Clr;
    // }

    
    function drawTwinLine(twoTiangleStrip,guiObj){

        var gl = getContextgl();
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var program = createProgram(gl, v_feather, f_feather);
        gl.useProgram(program.program);
    
        var array = [];
        array = twoTiangleStrip;
        console.log(array);
        var colorArr = [];

        for(var i = 0; i<array[0].length/2; i++){
            colorArr = colorArr.concat(0,0,1,1);
        }
        console.log(colorArr.length);

    
        var vertexBuffer = createBuffer(gl, new Float32Array(array[0]));
        bindAttribute(gl, vertexBuffer, program.a_triPos, 2);   


        if(guiObj.feather){
            var colorBuffer = createBuffer(gl, new Float32Array(array[1]));
            bindAttribute(gl, colorBuffer,program.a_color,4);
            var n = array[0].length / 2;
            gl.drawArrays(gl.TRIANGLES,0,n);    
        }
        else{
            var colorBuffer = createBuffer(gl, new Float32Array(colorArr));
            bindAttribute(gl, colorBuffer,program.a_color,4)
            var n = array[0].length / 2;
            gl.drawArrays(gl.TRIANGLES,0,n);    
        }

    
    }
}

function addColortoFeatherVertex(shallow, deep,deepClr, shallowClr){
    var FeatherStrip ={};
    var featherstrip = [];
    var color = [];
    // var deepClr = [0,0,0,0.8];
    // var shallowClr = [1,1,1,1];
    
    var len = shallow.length;
    if(len<3){
        for(var i =0; i<len-1; i++){
            featherstrip.push(shallow[i]);
            featherstrip.push(deep[i]);
            featherstrip.push(shallow[i+1]);
            featherstrip.push(deep[i+1]);
            for(var j = 0; j<2;j++){
               color =  color.concat(shallowClr)
               color = color.concat(deepClr);
            }
        }    
    }
    else{
        for(var i =0; i<len-1; i++){
            featherstrip.push(shallow[i]);
            featherstrip.push(deep[i]);
            featherstrip.push(shallow[i+1]);
            featherstrip.push(deep[i]);
            featherstrip.push(shallow[i+1]);
            featherstrip.push(deep[i+1]);
            for(var j = 0; j<3;j++){
               color =  color.concat(shallowClr)
               color = color.concat(deepClr);
            }
        }    
    }
    // let temp_xyz = [];
    // featherstrip.forEach((item)=>{
    //     item.z = 0;
    //     temp_xyz.push(item.x, item.y, item.z);
    // })
    // FeatherStrip.triangleStrip = temp_xyz;
    FeatherStrip.triangleStrip = toXYArray(featherstrip) ;

    FeatherStrip.colorArr = color;

    return FeatherStrip;
}

//平滑折线段
function smoothLine(vectors){
    var outputArr = [];
    outputArr.push(vectors[0]);
    for(var i =0; i<vectors.length-1;i++){
        x1 = vectors[i].x;
        y1 = vectors[i].y;
        x2 = vectors[i+1].x;
        y2= vectors[i+1].y;

        var Q = new THREE.Vector2(0.75*x1 +0.25*x2, 0.75*y1+0.25*y2);
        var R = new THREE.Vector2(0.25*x1 +0.75*x2, 0.25*y1+0.75*y2);

        outputArr.push(Q);
        outputArr.push(R);
    }
    outputArr.push(vectors[i]);
    return outputArr;
}

//num:迭代的次数
function getResultLine(vectors, num){

    var outputArr =[];
    var input = vectors.slice(0);
    for(var i = 0;i<num;i++){
        var tmp = smoothLine(input);
        input = tmp.slice(0);
    }
    outputArr = tmp;
    return outputArr;
}



//平角、斜角以及圆角的反走样
function BevelledAntialiased(originData, guiObj){
    var dataVectors = pointToVec(originData);
    var insertCoor = {};//存放四条线的坐标，一共三条三角形坐标条带
    let shallowClr = [0,0,0,1];
    let deepClr = [1,1,1,1];

    //向右平移获得绘制平角的坐标
    let originData1 = [];
    for(let i = 0; i<dataVectors.length; i++){
        let x = dataVectors[i].x+0.3;
        let y = dataVectors[i].y;
        let pt = new THREE.Vector2(x,y);
        originData1.push(pt);
    }

    //获得绘制圆角的坐标
    let originData2 = [];
    for(let i = 0; i<dataVectors.length; i++){
        let x = dataVectors[i].x+0.6;
        let y = dataVectors[i].y;
        let pt = new THREE.Vector2(x,y);
        originData2.push(pt);
    }

     // console.log(dataVectors,originData1,originData2);

    
    var linewidth = guiObj.width*transform()/2;
    var featherWidth = linewidth;

    if(guiObj.join ==="bevelledJoint"){
        draw_BevelledJoint(originData1);
    }

    if(guiObj.join ==="ArcJoint"){
        draw_ArcJoint(originData2);
    }

    if(guiObj.join ==="sharpJoint"){
        draw_Sharp_Joint(originData, guiObj);
    }

    function draw_BevelledJoint(data){
        let twoLineCoor = getTwoWholeLine(data, linewidth);
        insertCoor.left = twoLineCoor.left;
        insertCoor.right = twoLineCoor.right;
    
        twoLineCoor = getTwoWholeLine(data, linewidth +  featherWidth);
        insertCoor.leftFeather = twoLineCoor.left;
        insertCoor.rightFeather = twoLineCoor.right;
    
        let leftStrip = addColortoFeatherVertex(insertCoor.leftFeather, insertCoor.left,shallowClr,deepClr);
        let rightStrip = addColortoFeatherVertex(insertCoor.rightFeather,insertCoor.right,shallowClr,deepClr);
        let centralStrip = connectBeJoin(data,linewidth);

        // let centralStrip = {};
        // centralStrip.triangleStrip = connectBeJoin(dataVectors,linewidth);
        // let color = [];
        // for(let i =0; i<centralStrip.triangleStrip.length; i++){
        //     let clr = new color(1,1,1,1);
        //     color.push(clr.r, clr.g, clr.b, clr.a);
        // }
        // centralStrip.colorArr = color;

        //中心线和左右羽化边缘
        draw_Bevelled_Feather(centralStrip, leftStrip, rightStrip);
        // drawlineSequence(gl, leftStrip.triangleStrip, leftStrip.colorArr, draw_type);
        // drawlineSequence(gl, rightStrip.triangleStrip, rightStrip.colorArr, draw_type);
        // drawlineSequence(gl, centralStrip.triangleStrip, rightStrip.colorArr, draw_type);
        

    }

    function draw_ArcJoint(data){
        let twoLineCoor = roundCorner(data, linewidth);
        insertCoor.left = twoLineCoor.left;
        insertCoor.right = twoLineCoor.right;
        // var centralFan = twoLineCoor.fan;
        let centralFan = getFan(data, linewidth);
    
        twoLineCoor = roundCorner(data, linewidth +  featherWidth);
        insertCoor.leftFeather = twoLineCoor.left;
        insertCoor.rightFeather = twoLineCoor.right;
    
        let leftStrip = addColortoFeatherVertex(insertCoor.leftFeather, insertCoor.left,shallowClr,deepClr);
        let rightStrip = addColortoFeatherVertex(insertCoor.rightFeather,insertCoor.right,shallowClr,deepClr);
        let centralStrip = connectBeJoin(data,linewidth);

        // var centralStrip = {};
        // centralStrip.triangleStrip =  connectBeJoin(dataVectors,linewidth);
        // let color = [];
        // for(let i =0; i<centralStrip.triangleStrip.length; i++){
        //     let clr = new color(1,1,1,1);
        //     color.push(clr.r, clr.g, clr.b, clr.a);
        // }
        // centralStrip.colorArr = color;
        
        draw_Bevelled_Feather(centralStrip, leftStrip, rightStrip,centralFan);    
        // drawlineSequence(gl,leftStrip.triangleStrip,leftStrip.colorArr,draw_type);//GL.TRIANGLES
        // drawlineSequence(gl,rightStrip.triangleStrip,rightStrip.colorArr,draw_type);
        // drawlineSequence(gl,centralStrip.triangleStrip,centralStrip.colorArr,draw_type);
        // drawlineSequence(gl,centralFan.triangleStrip,centralFan.colorArr,draw_type);//gl.TRIANGLE_FAN
    }

    function roundCorner(originData, lineWidth){
        var twoRoundLine = {};
        var pt_lft = [];
        var pt_rht = [];
        let central_fan=[];

        //起始节点处的处理
        let vec1 = new THREE.Vector2();    
        let vec2 = new THREE.Vector2();    
        vec1.subVectors(originData[1],originData[0]);//last to current 方向向量
        vec1.normalize();
        let normal1 = getNormal(vec1);
    
        let t1 = getXY(normal1, originData[0], lineWidth);
        let t2 = getXY(normal1.negate(), originData[0], lineWidth);
        pt_lft.push(t1);
        pt_rht.push(t2);

        let len = originData.length;

        for (var i =1; i<len-1; i++){

            let v1 = new THREE.Vector2();
            let v2 = new THREE.Vector2();
        
            v1.subVectors(originData[i],originData[i-1]);//last to current 方向向量
            v2.subVectors(originData[i+1],originData[i]);

            let arr = bevelledJoin(originData[i-1], originData[i], originData[i+1], lineWidth);
            let arr2 = ArcJoin(originData[i],arr[0],arr[2]);    
            let arr3 = arr2.slice(2);
            // let arr3 = arr2;
            central_fan.push(arr2);
        
            let sign = cro(v1, v2);
            if(sign<0){
                //console.log(arr3);
                let arr4 = (pointToVec(arr3)).reverse();
                pt_lft = pt_lft.concat(arr4);
                //console.log(arr3);
                pt_rht.push(arr[1]);//插入折角内侧的插值点
            }
            else
            {
                pt_lft.push(arr[1]);
                pt_rht = pt_rht.concat(pointToVec(arr3));//插入折角内侧的插值点
            }
        }

        vec2.subVectors(originData[len - 1],originData[len - 2]);
        vec2.normalize();
        let normal2 = getNormal(vec2);
        let t3 = getXY(normal2, originData[len - 1],lineWidth);
        let t4 = getXY(normal2.negate(), originData[len -1],lineWidth);
        pt_lft.push(t3);
        pt_rht.push(t4);


        twoRoundLine.left = pt_lft;
        twoRoundLine.right = pt_rht;
        twoRoundLine.fan = central_fan;
        //console.log(pt_lft);

        return twoRoundLine;
    }

    function getThreeVertexOfBothSide (p1, p2, p3, lineWidth){
        let vec1 = new THREE.Vector2();
        let vec2 = new THREE.Vector2();
        let vec3 = new THREE.Vector2();
    
        //
        vec1.subVectors(p2,p1);//last to current 方向向量
        vec1.normalize();
        vec2.subVectors(p3,p2);
        vec2.normalize();
        vec3.addVectors(vec1, vec2);
        vec3.normalize();
    
        let points = {};
        //判断折线的折叠方向
        //顺时针
        var sign = cro(vec1, vec2);
        if (sign < 0){
            let normal1 = getNormal(vec1);
            let normal2 = getNormal(vec2);
            let miter = getNormal(vec3);
        
            let point1 = getXY(normal1, p2, lineWidth);
            let point2 = getXY(normal2, p2, lineWidth);
        
            let len = lineWidth/(normal1.dot(miter));
        
            let point3 = getXY(miter.negate(), p2, len);
            // var points = [point1, point3, point2];
            points.left = [point1, point2];
            points.right = point3;
        }
        //逆时针
        else{
            let normal1 = getNormal(vec1);
            let normal2 = getNormal(vec2);
            let miter = getNormal(vec3);
        
            let point1 = getXY(normal1.negate(), p2, lineWidth);
            let point2 = getXY(normal2.negate(), p2, lineWidth);
        
            let len = lineWidth/(normal1.dot(miter));
        
            let point3 = getXY(miter.negate(), p2, len);
            // var points = [point1, point3, point2];
            points.right = [point1, point2];
            points.left = point3;

        }
        return points;    
    }

    function getTwoWholeLine(originData, lineWidth){
        var points = {};//存储线段的左右两边的插值点
        var pt_lft = [];
        var pt_rht = [];

        //起始节点处的处理
        let vec1 = new THREE.Vector2();
        let vec2 = new THREE.Vector2();
    
        vec1.subVectors(originData[1],originData[0]);//last to current 方向向量
        vec1.normalize();
        let normal1 = getNormal(vec1);
    
        let t1 = getXY(normal1, originData[0], lineWidth);
        let t2 = getXY(normal1.negate(), originData[0], lineWidth);
        pt_lft.push(t1);
        pt_rht.push(t2);
    
        //中间节点处的斜接角
        let len = originData.length;
        for(var i = 1; i< len -1; i++){
            var arr = getThreeVertexOfBothSide(originData[i-1], originData[i], originData[i+1], lineWidth);
            var bool_lft =arr.left instanceof Array;
            var bool_rht =arr.right instanceof Array;
            //console.log(bool);
            if(bool_lft){
                pt_lft = pt_lft.concat(arr.left);
            }
            else{
                pt_lft.push(arr.left);
            }
            if(bool_rht){
                pt_rht = pt_rht.concat(arr.right);
            }
            else{
                pt_rht.push(arr.right);
            }
        }   
    
        //终止节点处的斜接角
        vec2.subVectors(originData[len - 1],originData[len - 2]);
        vec2.normalize();
        let normal2 = getNormal(vec2);
        let t3 = getXY(normal2, originData[len - 1],lineWidth);
        let t4 = getXY(normal2.negate(), originData[len -1],lineWidth);
        pt_lft.push(t3);
        pt_rht.push(t4);

        points.left = pt_lft;
        points.right = pt_rht;
    
        return points;
    }
        
    //绘制三条三角形带(添加羽化)
    function draw_Bevelled_Feather(centralStrip,leftStrip,rightStrip,centralFan){
        var gl = getContextgl();
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var program = createProgram(gl, v_feather, f_feather);
        gl.useProgram(program.program);

        var centralBuffer = createBuffer(gl,new Float32Array(centralStrip));
        var colorArray = [];
        for(var i =0; i<centralStrip.length/2; i++){
            colorArray = colorArray.concat([0,0,1,0.8]);
        }
        bindAttribute(gl,centralBuffer,program.a_triPos,2);  
        var colorBuffer = createBuffer(gl,new Float32Array(colorArray));

        bindAttribute(gl, colorBuffer,program.a_color,4);
        var n = centralStrip.length/2;
        gl.drawArrays(gl.TRIANGLES,0,n);


        if(typeof centralFan!='undefined'){
            var colorArray = [];
            let len = centralFan.length;
            for(var j = 0; j<len; j++){
                for(var i =0; i<centralFan[j].length/2; i++){
                    colorArray = colorArray.concat([0,0,0,0.8]);
                }
    
                var fanBuffer = createBuffer(gl,new Float32Array(centralFan[j]));
                bindAttribute(gl,fanBuffer,program.a_triPos,2);  
                var colorBuffer = createBuffer(gl,new Float32Array(colorArray));
                bindAttribute(gl, colorBuffer,program.a_color,4);
    
                var n = centralFan[j].length/2;
                gl.drawArrays(gl.TRIANGLE_FAN,0,n);
        
            }    
        }

        //羽化
        if(guiObj.feather){
            var triangleBuffer = createBuffer(gl,new Float32Array(leftStrip.triangleStrip));
            var colorBuffer1 = createBuffer(gl,new Float32Array(leftStrip.colorArr));
            bindAttribute(gl,triangleBuffer,program.a_triPos,2);
            bindAttribute(gl, colorBuffer1,program.a_color,4);
            var num = leftStrip.triangleStrip.length/2;
            console.log(num);
            gl.drawArrays(gl.TRIANGLES,0,num);


            triangleBuffer = createBuffer(gl,new Float32Array(rightStrip.triangleStrip));
            colorBuffer1 = createBuffer(gl,new Float32Array(rightStrip.colorArr));
            // gl.uniform1i(program.u_type,0);
            bindAttribute(gl,triangleBuffer,program.a_triPos,2);
            bindAttribute(gl, colorBuffer1,program.a_color,4);
            num = rightStrip.triangleStrip.length/2;
            gl.drawArrays(gl.TRIANGLES,0,num);
            console.log(num);
        }
    }







    function draw_Sharp_Joint(originData, guiObj){
        // if(!guiObj.gradient){
        //     var dataVectors = splitePolyline(originData,0.2);
        // }
        // else{
            var dataVectors = pointToVec(originData);
            // dataVectors = getResultArc(dataVectors);
            // dataVectors = getResultLine(dataVectors,5);
        // }
        var insertCoor = {};
        
        var line_width = transform()*guiObj.width;
        var featherWidth = line_width;
        var twoPointsArray = insertPoints(dataVectors,line_width,guiObj.gradient);
        var res = insertPoints(twoPointsArray[0],featherWidth,false);
        var leftFeatherArray = res[0];
        res = insertPoints(twoPointsArray[1],featherWidth,false);
        var rightFeatherArray = res[1];
    
    
        insertCoor.left = twoPointsArray[0];
        insertCoor.right = twoPointsArray[1];
        insertCoor.leftFeather = leftFeatherArray;
        insertCoor.rightFeather = rightFeatherArray;
    
        var centralLine  = toXYArray(ptsToTriangles(insertCoor.left, insertCoor.right));
        var centralTriangle = toXYArray(ptsToTriangleStrip(insertCoor.left, insertCoor.right));
        var leftstrip = addColortoFeatherVertex(insertCoor.leftFeather, insertCoor.left,shallowClr,deepClr);
        var rightstrip = addColortoFeatherVertex(insertCoor.rightFeather,insertCoor.right,shallowClr,deepClr);
    
        drawTheFeather(centralLine,leftstrip, rightstrip,centralTriangle, guiObj);

        // drawlineSequence(gl,)
    
        function drawTheFeather(centralLine,leftStrip, rightStrip,centralTriangle, guiObj){
            var gl = getContextgl();
            gl.clearColor(1, 1, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            var program = createProgram(gl, v_feather, f_feather);
            gl.useProgram(program.program);


            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
    
            var centralBuffer = createBuffer(gl,new Float32Array(centralLine));
            // gl.uniform1i(program.u_type,1);
            var colorArray = [];
            for(var i =0;i<centralLine.length/2; i++){
                colorArray = colorArray.concat([0,0,0,0.8]);
            }
            bindAttribute(gl,centralBuffer,program.a_triPos,2);  
            var colorBuffer = createBuffer(gl,new Float32Array(colorArray));
    
            bindAttribute(gl, colorBuffer,program.a_color,4);
            // gl.uniform4fv(program.u_centralClr,[0,0,1,0]);
            var n = centralLine.length/2;
            gl.drawArrays(gl.TRIANGLES,0,n);
    
    
            if(guiObj.feather){
                var triangleBuffer = createBuffer(gl,new Float32Array(leftStrip.triangleStrip));
                var colorBuffer1 = createBuffer(gl,new Float32Array(leftStrip.colorArr));
                // gl.uniform1i(program.u_type,0);
                bindAttribute(gl,triangleBuffer,program.a_triPos,2);
                bindAttribute(gl, colorBuffer1,program.a_color,4);
                var num = leftstrip.triangleStrip.length/2;
                console.log(num);
                gl.drawArrays(gl.TRIANGLES,0,num);
    
                triangleBuffer = createBuffer(gl,new Float32Array(rightStrip.triangleStrip));
                colorBuffer1 = createBuffer(gl,new Float32Array(rightStrip.colorArr));
                // gl.uniform1i(program.u_type,0);
                bindAttribute(gl,triangleBuffer,program.a_triPos,2);
                bindAttribute(gl, colorBuffer1,program.a_color,4);
                num = rightStrip.triangleStrip.length/2;
                gl.drawArrays(gl.TRIANGLES,0,num);
                console.log(num);
    
            }
    
    
            if(guiObj.triangle){
                var centralBuffer1 = createBuffer(gl,new Float32Array(centralTriangle));
                var colorArray1 = [];
                for(var i =0;i<centralTriangle.length/2; i++){
                    colorArray1 = colorArray1.concat([1,0,0,1]);
                }
                bindAttribute(gl,centralBuffer1,program.a_triPos,2);  
                var colorBuffer1 = createBuffer(gl,new Float32Array(colorArray1));
    
                bindAttribute(gl, colorBuffer1,program.a_color,4);
                let number = centralTriangle.length/2;
                gl.drawArrays(gl.LINE_STRIP,0,number);
    
                }
        }
    }
    






    // function drawArc(){
    //     var gl = getContextgl();
    //     gl.clearColor(0.8, 0.8, 0.8, 1);
    //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //     var program = createProgram(gl, v_Shader, f_Shader);
    //     gl.useProgram(program.program);
    
    //     // var centralLine = toXYArray(getResultArc(pointToVec(PS)));
    //     // console.log(centralLine);
    //     // // var centralLine = PS;
    //     // var centralBuffer = createBuffer(gl,new Float32Array(centralLine));
    //     // gl.uniform4fv(program.u_color,[1,0,0,1]);
    //     // bindAttribute(gl,centralBuffer,program.a_Position,2);  
    
    //     // var n = centralLine.length/2;
    //     // gl.drawArrays(gl.LINE_STRIP,0,n);
    
    //     var centralLine = toXYArray(insertCoor.left);
    //     console.log(centralLine);
    //     var centralBuffer = createBuffer(gl,new Float32Array(centralLine));
    //     gl.uniform4fv(program.u_color,[1,0,0,1]);
    //     bindAttribute(gl,centralBuffer,program.a_Position,2);  
    
    //     var n = centralLine.length/2;
    //     gl.drawArrays(gl.LINE_STRIP,0,n);
    
    
    // }
    
}
