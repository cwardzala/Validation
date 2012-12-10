(function (window, undefined) {
    // rules
	var rules = {},
        $ = window.jQuery;

    rules.required = function (value) {
        return !!value;
    };

    rules.types = {
        text : function () { return true; },
        email : function (value) {
            var re = /^[^\s()<>@,;:\/]+@\w[\w\.\-]+\.[a-z]{2,}$/i;
            return re.test(value);
        },
        number : function (value) { return $.isNumeric(value); }
    };

    // extend our local rules with user defined global rules.
    $.extend(rules, window.rules || {});

    // Main library
    var validate = function (formData) { return new validate.m.init(formData); },

        getInputType = function (elm) {
            var $elm = $(elm);
            if (!$elm.is('input')) { return null; }
            if (!$elm.attr('type')) { return 'text'; }
            return $elm.attr('type');
        };

    validate.m = validate.prototype = {
        init : function (formData) {

            if (!formData) { return this; }


            console.log(this);
            if (typeof formData === 'string') {
                formData = validate.m.formatFormData($(formData));
            }

            // if we are dealing with a jQuery selector.
            if (formData instanceof $) {
                formData = validate.m.formatFormData(formData);
            }

            if (formData.count !== Object.keys(formData.fields).length) {
                formData.count = Object.keys(formData.fields).length;
            }
            this.formData = validate.m.process(formData);
            return this;
        }
    };

    validate.m.formatFormData = function ($form) {
        if (!$form) {return this;}

        if ($form.is('form')) {
            $form = $form.find('input, textarea, select');
        }

        var data = {
            fields : {},
            status : true,
            count : 0
        };

        $form.each(function (i, node) {
            data.fields[node.id || node.name || 'FormControl-' + i] = {
                required: $(node).prop('required'),
                rules : $(node).data('rules') ? $(node).data('rules').split(' ') : [],
                value : $(node).val() === 'on' ? $(node).is(':checked') : $(node).val(),
                status : true,
                type : getInputType(node)
            };
            data.count = data.count + 1;
        });

        return data;
    };

    validate.m.process = function (formData) {
        if (!formData) { return this; }

        for (var field in formData.fields) {

            if (formData.fields.hasOwnProperty(field)) {

                var control = formData.fields[field];
                if (control.value !== '' || control.required === true) {
                    var test = true;

                    if (control.required && rules.required) {
                        test = rules.required(control.value) && test;
                    }

                    if (control.type && rules.types[control.type]) {
                        test = rules.types[control.type](control.value) && test;
                    }

                    for (var i=0; i < control.rules.length; i++) {
                        var rule = control.rules[i];

                        if (rules[rule]) {
                            test = rules[rule](control.value) && test;
                        }

                    }
                    control.status = test && control.status;
                    formData.status = test && formData.status;
                }
            }
        }
        return formData;
    };

    validate.helpers = {};
    validate.helpers.disableHTML5Validation = function (elm) {
        var $elm = $(elm || 'form');
        console.log($elm);
        $elm.attr('formnovalidate', 'formnovalidate');
        $elm.attr('novalidate', 'novalidate');
    };

    validate.m.init.prototype = validate.m;

    window.rules = rules;
	window.validate = validate;

})(window);
