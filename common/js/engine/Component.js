
define(function(require) {

    /**
     * Component
     */
    return Class.extend({
        init: function(type)
        {
            if (typeof(type) === 'undefined')
            {
                throw "Component: Invalid component type";
            }

            this.type = type;
            this.entity = null;
        },

        toJSON: function()
        {
            var returnObj = this.serialize();
            returnObj["type"] = this.type;

            return returnObj;
        },

        serialize: function()
        {
            throw "Serialize not overridden!";
        }
    });
});

