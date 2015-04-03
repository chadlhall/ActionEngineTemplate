
define(function(require) {

    var Component = require("engine/Component");

    /**
     * Entity
     */
    return Class.extend({
        init: function(id, type, x, y, width, height, logEntity)
        {
            this.id = id || 0;
            this.type = type;

            this._x = x;
            this._y = y;
            this.width = width;
            this.height = height;

            this.rotation = 0;

            this.toRemove = false;

            this.components = {};
            this.systems = [];
            this.engine = null;
            this.logEntity = logEntity || false;
        },

        addComponent: function(component)
        {
            if (!component instanceof(Component))
            {
                throw "This isn't really a component!";
            }

            this.components[component.type] = component;
            component.entity = this;
        },

        getComponent: function(componentType)
        {
            return this.components[componentType] || null;
        },

        hasComponent: function(componentType)
        {
            return this.getComponent(componentType) !== null;
        },

        addSystem: function(system)
        {
            this.systems.push(system);
        },

        toJSON: function()
        {
            var returnObj = {
                id: this.id,
                type: this.type,
                x: this._x,
                y: this._y,
                width: this.width,
                height: this.height,
                rotation: this.rotation,
                toRemove: this.toRemove,
                components: [],
                logEntity: this.logEntity
            };

            for (var c in this.components)
            {
                if (this.components.hasOwnProperty(c))
                {
                    returnObj.components.push(this.components[c]);
                }
            }

            return returnObj;
        }
    });
});