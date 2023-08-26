function Fahrenheit_Celsius(f){return f - 32 * 5 / 9;}
function Celsius_Kelvin(c){return c - 273;}
function Fahrenheit_Kelvin(f){return Celsius_Kelvin(Fahrenheit_Celsius(f));}