

export class BaseClass {
    

    static extend(props: any) {

    }

    setProps(props: any) {
        let keys = Object.keys(props);
        for (let key in keys) {
            if (typeof props[key] !== "function") {
                this[key] = props[key];
            }
        }
        return this;
    }

}

export function setProps(base, props) {
    let keys = Object.keys(props);
    for (let i = 0; i < keys.length; i += 1) {
        let key = keys[i];
        if (typeof props[key] !== "function") {
            base[key] = props[key];
        }
    }
    return base;
}


(function setBaseClass() {
    let initializing = false;
    // @ts-ignore
    const fnTest = /xyz/.test(function () {xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    // @ts-ignore
    BaseClass = function () { };

    BaseClass.prototype.setProps = function (props) {
        let keys = Object.keys(props);
        for (let i = 0; i < keys.length; i += 1) {
            let key = keys[i];
            if (typeof props[key] !== "function") {
                this[key] = props[key];
            }
        }
        return this;
    }

    // Create a new Class that inherits from this class
    BaseClass.extend = function (prop) {
        const _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        const prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (let name in prop) {
            // Check if we're overwriting an existing function
            // @ts-ignore
            prototype[name] = typeof prop[name] === "function" && typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        // @ts-ignore
                        const tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        // @ts-ignore
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        // @ts-ignore
                        const ret = fn.apply(this, arguments);
                        // @ts-ignore
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function BaseClass() {
            // All construction is actually done in the init method
            // @ts-ignore
            if (!initializing && this.init) {
                // @ts-ignore
                this.init.apply(this, arguments);
            }

            this.setProps = function (props: any) {
                let keys = Object.keys(props);
                for (let i = 0; i < keys.length; i += 1) {
                    let key = keys[i];
                    if (typeof props[key] !== "function") {
                        this[key] = props[key];
                    }
                }
                return this;
            }

        }

        // Populate our constructed prototype object
        BaseClass.prototype = prototype;

        // Enforce the constructor to be what we expect
        BaseClass.prototype.constructor = BaseClass;

        // And make this class extendable
        // BaseClass.extend = setBaseClass; // arguments.callee;

        return BaseClass;
    };

})();