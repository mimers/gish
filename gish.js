var gishBottom = 500;
var gishGravity = 1.3;

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
	ctx.lineTo(this.x+this.force.fx*10, this.y);
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x, this.y+this.force.fy*10);
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
	this.k = 0.220;
}

GishArm.prototype.currentLength = function(shoulder) {
	return this.ph.distance(shoulder);
};

GishArm.prototype.force = function(clength) {
	//calc current line elasticity with another point
	return this.k * (clength-this.length);
};

function init () {
	var ps = [];
	ps[0] = new GishPoint(200,200);
	ps[0].speed.sx = 20;
	var r = 100;
	for (var i = 0; i < Math.PI*2; i+=Math.PI/5) {
		ps[ps.length] = new GishPoint(200 + r*Math.sin(i),
		 200+r*Math.cos(i));
	};
	for (var i = 0; i < ps.length; i++) {
		for (var j = 0; j < ps.length; j++) {
			if(i!=j)
				ps[i].connectTo(ps[j]);
		};
	};

	var cvs = document.getElementById('cvs');
	cvs.height = cvs.clientHeight;
	cvs.width = cvs.clientWidth;
	var ctx = cvs.getContext('2d');
	setInterval(function () {
		ctx.fillStyle='rgba(220,220,220,0.8)';
        ctx.fillRect(0,0,gishBottom, gishBottom);
		for(p in ps){
			ps[p].applyForce(0.16);
			ps[p].draw(ctx);
		}
		for(p in ps){
			ps[p].go(0.16);
			ps[p].draw(ctx);
		}
	}, 18);
}

init();