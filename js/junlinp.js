
/*
    Params:
        pts : Array of THREE.Vector3
        line_width : double

    Returns:
        array : a array of THREE.Vector3 with three point stand for a triangle
                Draw Type : gl.TRIANGLES
*/


function generateBevelledPoint(pts, line_width) {

    if (pts === undefined || pts.length < 2) {
        return undefined;
    }

    let res = [];

    let start_vector = new THREE.Vector3();
    start_vector.subVectors(pts[1], pts[0]);
    let left_miter = new THREE.Vector3();
    left_miter.crossVectors(new THREE.Vector3(0, 0, 1), start_vector);
    left_miter.normalize();
    left_miter.multiplyScalar(line_width);

    let right_miter = left_miter.clone();
    right_miter.multiplyScalar(-1.0);

    let left_point = new THREE.Vector3();
    let right_point = new THREE.Vector3();

    left_point.addVectors(pts[0], left_miter);
    right_point.addVectors(pts[0], right_miter);

    for(let i = 1; i < pts.length - 1; i++) {
        let pre_point = pts[i - 1];
        let current_point = pts[i];
        let next_point = pts[i + 1];

        let pre_vec = new THREE.Vector3();
        let next_vec = new THREE.Vector3();

        pre_vec.subVectors(current_point, pre_point);
        next_vec.subVectors(next_point, current_point);

        let direct = new THREE.Vector3();
        direct.crossVectors(pre_vec, next_vec);
        // direct is negative stand for clock-wise


        next_vec.multiplyScalar(-1.0);
        pre_vec.normalize();
        next_vec.normalize();

        let semi_vec = new THREE.Vector3();
        semi_vec.add(pre_vec, next_vec);

        semi_vec.normalize();
        let semi_width = - line_width / (semi_vec.x * next_vec.x + semi_vec.y * next_vec.y);

        semi_vec.multiplyScalar(semi_width );


        let semi_point = new THREE.Vector3();
        let pre_vec_point = new THREE.Vector3();
        let next_vec_point = new THREE.Vector3();

        if (direct.z > 0) {

            next_vec.crossVectors(new THREE.Vector3(0, 0, 1), next_vec);
            pre_vec.crossVectors(new THREE.Vector3(0, 0, -1), pre_vec);
        } else if (direct.z < 0) {

            next_vec.crossVectors(new THREE.Vector3(0, 0, -1), next_vec);
            pre_vec.crossVectors(new THREE.Vector3(0, 0, 1), pre_vec);
        } else {
            console.log( "Direct equals to zero");
            return [];
        }

        pre_vec.multiplyScalar( line_width );
        next_vec.multiplyScalar(line_width);

        semi_point.addVectors(current_point, semi_vec);
        pre_vec_point.addVectors(current_point, next_vec);
        next_vec_point.addVectors(current_point, pre_vec);

        if (direct.z > 0) {

            res.push(left_point, right_point, next_vec_point);
            res.push(left_point, next_vec_point, semi_point);
            res.push(next_vec_point, semi_point, pre_vec_point);
            left_point = semi_point;
            right_point = pre_vec_point;

        } else if (direct.z < 0) {
            res.push(left_point, right_point, next_vec_point);
            res.push(right_point, semi_point, next_vec_point);
            res.push(next_vec_point, semi_point, pre_vec_point);
            left_point = pre_vec_point;
            right_point = semi_point;
        } else {
            console.log( "Direct equals to zero");
            return [];
        }

    }


    let end_index = pts.length - 1;

    let end_vector = new THREE.Vector3();
    end_vector.subVectors(pts[end_index], pts[end_index - 1]);
    let end_vector_miter = new THREE.Vector3();
    end_vector_miter.crossVectors(new THREE.Vector3(0, 0, 1), end_vector);
    end_vector_miter.normalize();
    end_vector_miter.multiplyScalar( line_width );

    let left_end_point = new THREE.Vector3();
    let right_end_point = new THREE.Vector3();

    left_end_point.addVectors(pts[end_index], end_vector_miter);
    end_vector_miter.multiplyScalar( -1.0 );
    right_end_point.addVectors(pts[end_index], end_vector_miter);

    res.push(left_point, right_point, right_end_point);
    res.push(left_point, right_end_point, left_end_point);
    return res;
}