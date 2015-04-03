
define(function(require) {

    /**
     * A Component represents a piece of data attached to an Entity. Components are primarily utilized by Systems
     * to express interest in, and then run game logic on Entities.
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

