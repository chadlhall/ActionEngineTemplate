define(function (require)
{
	"use strict";

	var moduleName = "Point";

	var Point = Class.extend({
		init: function (options, y)
		{
			if (typeof options === 'object' && options !== null)
			{
				this.x = options.x;
				this.y = options.y;
			}
			else
			{
				this.x = options;
				this.y = y;
			}
		},

		isValid: function()
		{
			return this.x !== null && this.y !== null && !isNaN(this.x) && !isNaN(this.y);
		},

		invalidate: function()
		{
			this.x = null;
			this.y = null;
		},

		isOrigin: function()
		{
			return this.x === 0 && this.y === 0;
		},

		setCoordinates: function(otherPoint)
		{
			this.x = otherPoint.x;
			this.y = otherPoint.y;
		},

		getTranslation: function(otherPoint, y)
		{
			if (otherPoint instanceof Point)
			{
				return new Point({
					x: this.x + otherPoint.x,
					y: this.y + otherPoint.y
				});
			}
			else
			{
				return new Point({
					x: this.x + otherPoint,
					y: this.y + y
				});
			}
		},

		translate: function(otherPoint)
		{
			this.x += otherPoint.x;
			this.y += otherPoint.y;
		},

		distanceFrom: function(otherPoint)
		{
			return Math.sqrt(Math.pow(otherPoint.x - this.x, 2) + Math.pow(otherPoint.y - this.y, 2));
		},

		normalize: function()
		{
			if (this.x === 0 && this.y === 0)
			{
				return;
			}
			var length = Math.sqrt((this.x * this.x) + (this.y * this.y));
			this.x = this.x / length;
			this.y = this.y / length;
		},

		multiplyBy: function(value)
		{
			this.x *= value;
			this.y *= value;
		},

		getMultiplication: function(value)
		{
			return new Point({
				x: this.x*value,
				y: this.y*value
			});
		},

		translateX: function (dx)
		{
			this.x += dx;
		},

		translateY: function (dy)
		{
			this.y += dy;
		}
	});

	return Point;
});