var canadian_cities = ["Brampton","Calgary","Charlottetown","Edmonton","Frederiction","Hailfax","Hamilton","Iqaluit","Mississauga","Montreal","Ottawa","Quebec City","Regina","Saint John","Saskatoon","St. John's","Toronto","Victoria","Winnipeg","Vancouver", "Yellowknife", "Whitehorse"]
var cities = canadian_cities;
var category_codes = {"CA":"Canadian Provinces & Territories"}
var question_data = {
    "count": 13,
    "questions": {
        1:{"id":1,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Ontario", "answer":"Toronto", "options":canadian_cities},
        2:{"id":2,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Quebec", "answer":"Quebec City", "options":canadian_cities},
        3:{"id":3,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Nova Scotia", "answer":"Hailfax", "options":canadian_cities},
        4:{"id":4,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"New Brunswick", "answer":"Frederiction", "options":canadian_cities},
        5:{"id":5,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Manitoba", "answer":"Winnipeg", "options":canadian_cities},
        6:{"id":6,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"British Columbia", "answer":"Victoria", "options":canadian_cities},
        7:{"id":7,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Prince Edward Island", "answer":"Charlottetown", "options":canadian_cities},
        8:{"id":8,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Saskatchewan", "answer":"Regina", "options":canadian_cities},
        9:{"id":9,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Alberta", "answer":"Edmonton", "options":canadian_cities},
        10:{"id":10,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Newfoundland and Labrador", "answer":"St. John's", "options":canadian_cities},
        11:{"id":11,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Northwest Territories", "answer":"Yellowknife", "options":canadian_cities},
        12:{"id":12,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Yukon", "answer":"Whitehorse", "options":canadian_cities},
        13:{"id":13,"type":"multiple_choice", "category":"CA", "structure":"administrative_capital", "keyword":"Nunavut", "answer":"Iqaluit", "options":canadian_cities}
    }
}