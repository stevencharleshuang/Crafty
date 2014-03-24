var Crafty = require('./core.js'),
    document = window.document;

/**@
 * #Delay
 * @category Utilities
 */
Crafty.c("Delay", {
    init: function () {
        this._delays = [];
        this.bind("EnterFrame", function () {
            var now = new Date().getTime();
            var index = this._delays.length;
            while (--index >= 0) {
                var item = this._delays[index];
                if (item === false) {
                    // remove canceled item from array
                    this._delays.splice(index, 1);
                } else if (item.start + item.delay + item.pause < now) {
                    item.callback.call(this);
                    if (item.repeat > 0) {
                        // reschedule item
                        item.start = now;
                        item.pause = 0;
                        item.pauseBuffer = 0;
                        item.repeat--;
                    } else if (item.repeat <= 0) {
                        // remove finished item from array
                        this._delays.splice(index, 1);
                        if(typeof item.callbackOff === "function")
                            item.callbackOff.call(this);
                    }
                }
            }
        });
        this.bind("Pause", function () {
            var now = new Date().getTime();
            for (var index in this._delays) {
                this._delays[index].pauseBuffer = now;
            }
        });
        this.bind("Unpause", function () {
            var now = new Date().getTime();
            for (var index in this._delays) {
                var item = this._delays[index];
                item.pause += now - item.pauseBuffer;
            }
        });
    },
    /**@
     * #.delay
     * @comp Delay
     * @sign public this.delay(Function callback, Number delay[, Number repeat[, Function callbackOff]])
     * @param callback - Method to execute after given amount of milliseconds. If reference of a
     * method is passed, there's possibility to cancel the delay.
     * @param delay - Amount of milliseconds to execute the method.
     * @param repeat - (optional) How often to repeat the delayed function. A value of 0 triggers the delayed
     * function exactly once. A value n > 0 triggers the delayed function exactly n+1 times. A
     * value of -1 triggers the delayed function indefinitely. Defaults to one execution.
     * @param callbackOff - (optional) Method to execute after delay ends(after all iterations are executed). 
     * If repeat value equals -1, callbackOff will never be triggered.
     *
     * The delay method will execute a function after a given amount of time in milliseconds.
     *
     * It is not a wrapper for `setTimeout`.
     *
     * If Crafty is paused, the delay is interrupted with the pause and then resume when unpaused
     *
     * If the entity is destroyed, the delay is also destroyed and will not have effect.
     *
     * @example
     *
     * The simplest delay
     * ~~~
     * console.log("start");
     * Crafty.e("Delay").delay(function() {
     *   console.log("100ms later");
     * }, 100, 0);
     * ~~~
     *
     * Delay with callbackOff to be executed after all delay iterations
     * ~~~
     * console.log("start");
     * Crafty.e("Delay").delay(function() {
     *   console.log("100ms later");
     * }, 100, 3, function() {
     *   console.log("delay finished");
     * });
     * ~~~
     *
     */
    delay: function (callback, delay, repeat, callbackOff) {
        this._delays.push({
            start: new Date().getTime(),
            callback: callback,
            callbackOff: callbackOff,
            delay: delay,
            repeat: (repeat < 0 ? Infinity : repeat) || 0,
            pauseBuffer: 0,
            pause: 0
        });
        return this;
    },
    /**@
     * #.cancelDelay
     * @comp Delay
     * @sign public this.cancelDelay(Function callback)
     * @param callback - Method reference passed to .delay
     *
     * The cancelDelay method will cancel a delay set previously.
     *
     * @example
     * ~~~
     * var doSomething = function(){
     *   console.log("doing something");
     * };
     *
     * // execute doSomething each 100 miliseconds indefinetely
     * var ent = Crafty.e("Delay").delay(doSomething, 100, -1);
     *
     * // and some time later, cancel further execution of doSomething
     * ent.cancelDelay(doSomething);
     * ~~~
     */
    cancelDelay: function (callback) {
        var index = this._delays.length;
        while (--index >= 0) {
            var item = this._delays[index];
            if(item && item.callback == callback){
                this._delays[index] = false;
            }
        }
        return this;
    }
});
