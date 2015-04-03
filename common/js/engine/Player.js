
define(function(require) {
    return Class.extend({
        init: function(id, name, isLocal, isAI)
        {
            this.id = id;
            this.name = name;
            this.isLocal = isLocal;
            this.isAI = isAI;
            this.input = {};
        },

        setInput: function(input)
        {
            this.input = input;
            input.player = this;
        },

        toJSON: function()
        {
            return {
                id: this.id,
                name: this.name,
                isLocal: this.isLocal,
                isAI: this.isAI
            }
        }
    });
});