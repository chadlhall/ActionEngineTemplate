
define(function(require) {

    var Entity = require("engine/Entity");

    /**
     * EntityBuilder
     */
    return Class.extend({

        init: function()
        {
            this.engine = null;
            this.resourceManger = null;
        },

        createEntity: function(options)
        {
            var e = new Entity(options.id, options.type, options.x, options.y, options.width, options.height, options.logEntity);

            if (options.components)
            {
                for (var c in options.components)
                {
                    if (options.components.hasOwnProperty(c))
                    {
                        e.addComponent(this.createComponent(options.components[c], e));
                    }
                }
            }

            return e;
        },

        createComponent: function(options, entity)
        {
            var ComponentType = this.getComponentType(options, entity);

            if (typeof(ComponentType) === 'undefined')
            {
                throw "EntityBuilder: getComponentType() did not return a valid component!";
            }

            return new ComponentType(options);
        },

        getComponentType: function(options, entity)
        {
            throw "EntityBuilder: getComponentType has NOT been overridden";
        }
    });
});
