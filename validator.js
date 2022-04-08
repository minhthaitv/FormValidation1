// Hàm Validator
function Validator(options) {
    //Khi the input bi nhet qua nhieu the div
    //Nen k lay dc parentElement
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement 
        }
    }

    //De khong bi ghi de ham dung bien nay de luu
    var selectorRules = {}

    // Ham thuc hien validate
    function validate(inputElement, rule) {
        var errorElement = 
        getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        //Lay ra cac rule cua selector
        var rules = selectorRules[rule.selector]

        //Lap qua tung rule va kiem tra
        //Neu co loi thi dung viec kiem tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage=rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage=rules[i](inputElement.value)
            }
            // console.log(errorMessage)
            if(errorMessage){
                break
            }
        }


        if (errorMessage) {
            // console.log(errorElement)
            errorElement.innerText = errorMessage
            getParent(inputElement,options.formGroupSelector).classList.add("invalid")
        } else {
            errorElement.innerText = ''
            getParent(inputElement,options.formGroupSelector).classList.remove("invalid")
        }

        return !errorMessage
    }

    //Lay element form can validate
    var formElement = document.querySelector(options.form)
    if (formElement) {

        //Khi click nut dang ky
        formElement.onsubmit = function(e){
            e.preventDefault()
            //Lap qua tung rule va validate luon

            var isFormValid = true
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid =  validate(inputElement, rule)
                if(!isValid){
                    isFormValid = false
                }
            })

           


            if(isFormValid){
                //Submit voi JavaScript
                if (typeof options.onSubmit === 'function'){
                    
                    var enableInputs = 
                    formElement.querySelectorAll('[name]:not([disabled])') 
                    //Note khuc nay
                    var formValue  = Array.from(enableInputs).reduce(
                        (values,input)=>{
                            
                            switch(input.type){
                                case 'radio':
                                    values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value
                                    break;
                                case 'checkbox':
                                    if(!input.matches(':checked')) {
                                        values[input.name] = ''
                                        return values
                                    }
                                    if(!Array.isArray(values[input.name])){
                                        values[input.name] = []
                                    }
                                    values[input.name].push(input.value)
                                    break;
                                case 'file':
                                    values[input.name] = input.files
                                    break;
                                default:
                                    values[input.name] = input.value
                            }

                            return values
                        },{}
                    )
                    
                    options.onSubmit(formValue)
                }else{ 
                //Truong hop submit voi hanh vi mac dinh
                    formElement.submit()

                }
            }
        }

        // Duyet rule va xu ly {lang nghe event blur, input}
        options.rules.forEach(rule => {
            //Luu lai cac rule cho moi input nhung van bi ghi de key
            // selectorRules[rule.selector] = rule.test

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(
                (inputElement) =>{
                    if (inputElement) {
                        //Xu ly khi blur khoi input
                        inputElement.onblur = () => {
                            validate(inputElement, rule)
                        }
        
                        //Xu ly moi khi nguoi dung nhap vao input
                        inputElement.oninput = () => {
                            var errorElement = getParent(inputElement,options.formGroupSelector).querySelector('.form-message')
                            errorElement.innerText = ''
                            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                        }
                    }
                }
            )
            
        })
            // console.log(selectorRules)
            ;
    }
}



Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}


Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}