const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema({
    country:{
        type:String,
        required:true,
        validator(value){
            if(validator.isEmpty(value)){
                throw new Error('Please choose your country!')
            }
        }
    },
    firstName:{
        type: String,
        required: true ,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your first name!')
            }
        }
    },
    lastName:{
        type:String, 
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your last name!')
            }
        }
    },
    email:{
        type:String, 
        required: true,
        trim: true,
        validator(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your email address!')
            }
            if(!validator.isEmail(value)){
                throw new Error("Your email address is not valid!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your password!')
            }
            if(!validator.isLength(value,{min:8})){
                throw new Error('Your password must be at least 8 characters!')
                alert(Error)
            }
        }
    },
    confirmPassword:{
        type: String,
        required: true,
        validate(value) {
            if(!validator.equals(value, this.password)){
            throw new Error('Your password should be the same as Confirm password!')
            }
        }
    },
    address1:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input address!')
            }
        }
    },
    address2:{
        type: String,
        required:false
    },
    city:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input city!')
            }
        }
    },
    state:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input state!')
            }
        }
    },
    zip:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:String,
        required:false,
        validate(value){
            if((!validator.isEmpty(value))&&(!validator.isMobilePhone(value, ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY', 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'de-CH', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG', 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'en-ZW' , 'es-CL', 'es-CO', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE', 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW']))){
                throw new Error('Your phone number is not valid!')
            }
        }
    }
})

module.exports = mongoose.model("User", userSchema);