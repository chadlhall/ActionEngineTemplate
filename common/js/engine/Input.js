define(function (require)
{
    "use strict";

    var Point = require("engine/geom/Point");

    return Class.extend({
        init: function(canvas)
        {
            // The canvas that this Input object binds event handlers to
            this.canvas = canvas;

            this.player = null;

            //this.networkComponent = null;

            // The location of the last "click" event.
            this.click = new Point(null, null);

            // The location of the last "rightclick" event
            this.rightClick = new Point(null, null);

            // The current location of the mouse on the canvas, updated every frame.
            this.mouse = new Point({
                x: 0,
                y: 0
            });

            // The location of the mouse in the last frame. Useful for findign how far the mouse has moved.
            this.lastMouse = new Point({
                x: 0,
                y: 0
            });

            this.mouseScreen = new Point({
                x: 0,
                y: 0
            });

            this.lastMouseScreen = new Point({
                x: 0,
                y: 0
            });

            // Whether or not the left mouse button is currently down.
            this.mouseDown = false;

            // The position that the left mouse button went down on. Resets to null when the mouse is released
            this.mouseDownCoords = new Point(null, null);

            // Whether or not the left mouse button is currently released.
            this.mouseUp = true;

            // The position the mouse clicker was last released on.
            this.mouseUpCoords = new Point(null, null);

            this.middleMouseDown = false;
            this.middleMouseUp = true;

            // The current delta of the last mouse wheel move
            this.mouseWheel = 0;

            // Whether or not the shift key is being held down
            this.shiftDown = false;

            // Whether or not the space key is being held down
            this.spaceDown = false;

            this.ctrlDown = false;

            // Whether or not the arrow keys are being held down
            this.leftArrowDown = false;
            this.upArrowDown = false;
            this.rightArrowDown = false;
            this.downArrowDown = false;

            // Array of keys that are currently being held down
            this.keysDown = [];

            this.keysUpThisFrame = [];

            this.stateFields = [];
            this.previousStates = [];
            this.bufferedInput = [];
            this.lastUpdateTime = 0;

            this.bindEventHandlers();
        },

        bufferInput: function(input)
        {
            this.bufferedInput.push(input);
        },

        setStateFields: function(fields)
        {
            this.stateFields = this.stateFields.concat(fields);
        },

        getChangedFields: function()
        {
            var lastState = {};
            var changedState = {};

            if (this.previousStates.length > 0)
            {
                lastState = this.previousStates[this.previousStates.length-1];
            }

            for (var i = 0; i < this.stateFields.length; i++)
            {
                var field = this.stateFields[i];
                var oldValue = lastState[field];
                var newValue = this[field];

                if (newValue !== oldValue)
                {
                    changedState[field] = newValue;
                }
            }

            return changedState;
        },

        saveState: function()
        {
            var state = {};
            for (var i = 0; i < this.stateFields.length; i++)
            {
                var field = this.stateFields[i];
                state[field] = this[field];
            }

            this.previousStates.push(state);

            if (this.previousStates.length > 10)
            {
                this.previousStates.shift();
            }
        },

        reset: function ()
        {
            this.lastMouse.setCoordinates(this.mouse);
            this.lastMouseScreen.setCoordinates(this.mouseScreen);
            this.click.invalidate();
            this.rightClick.invalidate();
            this.mouseWheel = 0;
            this.keysUpThisFrame.length = 0;

            if (this.mouseUp && this.mouseDownCoords)
            {
                this.mouseDownCoords.invalidate();
                this.mouseUpCoords.invalidate();
            }
        },

        update: function (time)
        {
            this.lastUpdateTime = time;
        },

        updateFromBuffer: function()
        {
            if (this.bufferedInput.length > 0)
            {
                var input = this.bufferedInput.shift();

                for (var i = 0; i < this.stateFields.length; i++)
                {
                    var f = this.stateFields[i];

                    if (typeof(input[f]) !== 'undefined')
                    {
                        this[f] = input[f];
                    }
                }

                this.lastUpdateTime = input.timestamp;
            }
        },

        keyDown: function (e)
        {
            if (e.shiftKey)
            {
                this.shiftDown = true;
            }

            if (e.ctrlKey)
            {
                this.ctrlDown = true;
            }

            switch(e.keyCode) {
                case 32: this.spaceDown = true; break;
                case 37: this.leftArrowDown = true; break;
                case 38: this.upArrowDown = true; break;
                case 39: this.rightArrowDown = true; break;
                case 40: this.downArrowDown = true; break;
            }

            var char = String.fromCharCode(e.which);

            if (e.which < 112)
            {
                var i;
                for (i = 0; i < this.keysDown.length; i++)
                {
                    if (this.keysDown[i] === char)
                    {
                        return;
                    }
                }

                this.keysDown.push(char);
            }
        },

        keyUp: function (e)
        {
            if (this.shiftDown && !e.shiftKey)
            {
                this.shiftDown = false;
            }

            if (this.ctrlDown && !e.ctrlKey)
            {
                this.ctrlDown = false;
            }

            switch(e.keyCode) {
                case 32: this.spaceDown = false; break;
                case 37: this.leftArrowDown = false; break;
                case 38: this.upArrowDown = false; break;
                case 39: this.rightArrowDown = false; break;
                case 40: this.downArrowDown = false; break;
            }

            var char = String.fromCharCode(e.which);
            if (e.which >= 112) // Don't get the function keys
            {
                return;
            }

            this.keysUpThisFrame.push(e.which);
            var i;
            for (i = 0; i < this.keysDown.length; i++)
            {
                if (this.keysDown[i] === char)
                {

                    this.keysDown.splice(i, 1);
                    break;
                }
            }
        },

        isKeyDown: function (key)
        {
            if (this.keysDown.length > 0)
            {
                for (var i = 0; i < this.keysDown.length; i++)
                {
                    if (this.keysDown[i] == key)
                    {
                        return true;
                    }
                }
            }

            return false;
        },

        onMouseDown: function (e, touch)
        {
            var coords = (!touch) ? {clientX: e.clientX, clientY: e.clientY} : {clientX: e.touches[0].pageX, clientY: e.touches[0].pageY};

            this.mouse.setCoordinates(this.getXandY(e));

            this.mouseDownCoords.setCoordinates(this.getXandY(e));
            this.mouseDown = true;
            this.mouseUp = false;
        },

        onMouseUp: function (e, touch)
        {
            var coords = (!touch) ? {clientX: e.clientX, clientY: e.clientY} : {clientX: this.mouse.x, clientY: this.mouse.y};
            this.mouseUpCoords.setCoordinates(this.getXandY(e));
            this.mouseUp = true;
            this.mouseDown = false;
        },

        onMiddleMouseDown: function(e)
        {
            this.middleMouseUp = false;
            this.middleMouseDown = true;
        },

        onMiddleMouseUp: function(e)
        {
            this.middleMouseDown = false;
            this.middleMouseUp = true;
        },

        mouseClicked: function (e)
        {
            this.click.setCoordinates(this.getXandY(e));
        },

        mouseRightClicked: function(e)
        {
            this.rightClick.setCoordinates(this.getXandY(e));
        },

        mouseMoved: function (e, touch)
        {
            this.mouse.setCoordinates(this.getXandY(e));
            this.mouseScreen.x = e.pageX;
            this.mouseScreen.y = e.pageY;
        },

        mouseWheelMoved: function (e)
        {
            this.mouseWheel += e.detail ? e.detail : -(e.wheelDelta / 10);
        },

        getXandY: function (e)
        {
            //var x = (e.clientX - this.canvas.getBoundingClientRect().left - getGameEngine().getCamera().offsetX) / getGameEngine().scale;
            //var y = (e.clientY - this.canvas.getBoundingClientRect().top - getGameEngine().getCamera().offsetY) / getGameEngine().scale;

            var x = e.clientX - this.canvas.getBoundingClientRect().left;
            var y = e.clientY - this.canvas.getBoundingClientRect().top;

            return {
                x: x,
                y: y
            };
        },

        getPlayer: function()
        {
            return this.player;
        },

        getNetworkComponent: function()
        {
            return this.networkComponent;
        },

        bindEventHandlers: function()
        {
            var that = this;
            var canvas = this.canvas;

            if (canvas)
            {
                $(canvas).on("blur", function() {
                    that.focusLost = true;

                    that.keysDown.length = 0;
                    that.shiftDown = false;
                    that.spaceDown = false;
                });

                $(canvas).on("focus", function() {
                    that.focusLost = false;
                });

                /*$(canvas).add(canvas).focus(function() {
                 that.focusLost = false;

                 that.keysDown.length = 0;
                 that.shiftDown = false;
                 that.spaceDown = false;
                 });*/

                $(canvas).on("contextmenu", function(e)
                {
                    that.mouseRightClicked(e);
                    e.preventDefault();
                    return false;
                });

                $(canvas).on("click", function(e) {
                    if (!$(canvas).is(":focus"))
                    {
                        $(canvas).focus();
                    }

                    switch(e.which) {
                        case 1:
                            that.mouseClicked(e);
                            break;
                        case 2:
                            that.mouseRightClicked(e);
                            break;
                    }

                    e.preventDefault();
                    return false;
                });

                $(canvas).on("dblclick", function(e) {
                    e.preventDefault();
                    return false;
                });

                $(canvas).on("mousedown", function(e) {
                    switch(e.which)
                    {
                        case 1:
                            that.onMouseDown(e);
                            break;

                        case 2:
                            that.onMiddleMouseDown(e);
                            break;
                    }

                    e.preventDefault();
                    return false;
                });

                $(canvas).on("mouseup", function (e)
                {
                    switch (e.which)
                    {
                        case 1:
                            that.onMouseUp(e);
                            break;

                        case 2:
                            that.onMiddleMouseUp(e);
                            break;
                    }

                    return false;
                });

                canvas.addEventListener("mousemove", function (e)
                {
                    if (!$(canvas).is(":focus"))
                    {
                        $(canvas).focus();
                    }

                    that.mouseMoved(e);
                    e.preventDefault();
                    return false;
                }, false);

                canvas.addEventListener('mousewheel', function (e)
                {
                    that.mouseWheelMoved(e);
                    e.preventDefault();
                    return false;
                }, false);

                canvas.addEventListener('DOMMouseScroll', function (e)
                {
                    that.mouseWheelMoved(e);
                    e.preventDefault();
                    return false;
                }, false);

                $(window).on('keydown', function (e)
                {
                    that.keyDown(e);
                    /*e.preventDefault();
                     return false;*/
                });

                $(window).on('keyup', function (e)
                {
                    that.keyUp(e);
                    /*e.preventDefault();
                     return false;*/
                });

                canvas.addEventListener("touchstart", function (e)
                {
                    that.onMouseDown(e, true);
                    e.preventDefault();
                    return false;
                }, false);

                canvas.addEventListener("touchmove", function (e)
                {
                    that.mouseMoved(e, true);
                    e.preventDefault();
                }, false);

                canvas.addEventListener("touchend", function (e)
                {
                    that.onMouseUp(e, true);
                    e.preventDefault();
                }, false);
            }
        },
    });
});