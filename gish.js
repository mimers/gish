var gishBottom = 500;
var gishGravity = 4.3;

function GishPoint (x, y) {
	this.m = 1;
	this.speed = {
		sx : 0,
		sy : 0
	};
	this.force = {
		fx : 0,
		fy : 0
	};
	this.x = x;
	this.y = y;
	this.arms = [];
}

GishPoint.prototype.connectTo = function(p) {
	var arm = new GishArm(p, this);
	this.arms[this.arms.length] = arm;
};

GishPoint.prototype.draw = function (ctx) {
	ctx.fillStyle = "gold";
	ctx.beginPath();
	ctx.arc(this.x, this.y, 6, 0, Math.PI*2, true);
    ctx.fill();
    ctx.strokeStyle="gold";
	for(a in this.arms){
		var arm = this.arms[a];
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(arm.ph.x, arm.ph.y);
		ctx.stroke();
	}
	ctx.strokeStyle = "red";
	ctx.beginPath();
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x+this.force.fx, this.y);
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x, this.y+this.force.fy);
	ctx.stroke();
}

GishPoint.prototype.go = function(delta) {
		var targetx  = this.x+this.speed.sx*delta;
		var targety  = this.y+this.speed.sy*delta;
		if (targety > gishBottom) {
			targety = gishBottom;
			this.speed.sy *= -0.41;
		}
		if (targetx < 0) {
			targetx = 0;
			this.speed.sx *= -0.41;
		}else if(targetx > gishBottom){
			targetx = gishBottom;
			this.speed.sx *= -0.41;
		}
		this.x = targetx;
		this.y = targety;
};

GishPoint.prototype.applyForce = function(delta) {
		this.calcForce();
		this.speed.sx += this.force.fx/this.m*delta;
		this.speed.sy += this.force.fy/this.m*delta;
};

GishPoint.prototype.calcForce = function () {
	this.force.fx = 0;
	this.force.fy = gishGravity;
	for(a in this.arms){
		var arm = this.arms[a];
		var cl = arm.currentLength(this);
		var af = arm.force(cl);
		var afx = af/cl*(arm.ph.x-this.x);
		var afy = af/cl*(arm.ph.y-this.y);
		this.force.fx += afx;
		this.force.fy += afy;
	}
}

GishPoint.prototype.distance = function(pb) {
	return Math.sqrt((this.x-pb.x)*(this.x-pb.x)+(this.y-pb.y)*(this.y-pb.y));
};

function GishArm (ph, pj) {
	this.ph = ph;
	this.length = pj.distance(ph);
	this.k = 0.4520;
}

GishArm.prototype.currentLength = function(shoulder) {
	return this.ph.distance(shoulder);
};

GishArm.prototype.force = function(clength) {
	//calc current line elasticity with another point
	return this.k * (clength-this.length);
};

function makeLine (pa, pb) {
	pa.connectTo(pb);
	pb.connectTo(pa);
}

function init () {
	var ps = [];
	var r = 100;
	ps[0] = new GishPoint(r,r);
	ps[0].speed.sx = 40;
	for (var i = 0; i < Math.PI*2; i+=Math.PI/7) {
		ps[ps.length] = new GishPoint(r + r*Math.sin(i),
		 r+r*Math.cos(i));
	};
	for (var j = 1; j < ps.length; j++) {
			makeLine(ps[0],ps[j]);
	};
	for (var j = 1; j < ps.length-1; j++) {
		makeLine(ps[j],ps[j+1]);
	};
	makeLine(ps[1], ps[ps.length-1]);


	var bstart = ps.length;
	for (var i = 0; i < Math.PI*2; i+=Math.PI/7) {
		ps[ps.length] = new GishPoint(r + r*Math.sin(i),
		 r+r*Math.cos(i));
	};
	ps[bstart].speed.sx = -10;
	for (var i = bstart; i < ps.length; i++) {
		for (var j = bstart; j < ps.length; j++) {
			if(i!=j)
				makeLine(ps[j], ps[i]);
		};
	};

	var cvs = document.getElementById('cvs');
	cvs.height = 500;
	cvs.width = 500;
	var ctx = cvs.getContext('2d');
	setInterval(function () {
		ctx.fillStyle='rgba(230,230,230,0.68)';
        ctx.fillRect(0,0,gishBottom, gishBottom);
		for(p in ps){
			ps[p].applyForce(0.16);
		}
		for(p in ps){
			ps[p].go(0.16);
			ps[p].draw(ctx);
		}
	}, 18);
}

init();