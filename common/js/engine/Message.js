
define(function(require) {

    return Class.extend({
        init: function(type)
        {
            this.type = type;
            this.logMessage = false;
        }
    });
});