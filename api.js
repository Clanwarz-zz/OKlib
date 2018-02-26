/**
 * @description
 * Demo Script that explains how to use the OK_lib
 * @example
 * registerPlugin({
 *     name: 'Demo Script',
 *     version: '1.0',
 *     description: 'OK_Lib_Demo',
 *     author: 'Author <author@example.com>',
 *     vars: []
 * }, function(sinusbot, config) {
 *      event.on('load', function(){
 *          var lib = require('OK_lib.js');
 *          //Your Code goes here
 *      }
 * });
 * 
 */
function registerPlugin() { }


/**
 * @mixin array
 */
class array {
    /**
     * Returns a String Representation of an Array
     * @param  {Object[]} array
     * @return {String}	A String Representation of the given Array
     */
    toString(array) { }
    /**
     * Concatenates two Arrays
     * @param  {Object[]} array
     * @param  {Object[]} elements
     * @return {Object[]} Returns a new Array containing all Elements of the two given Arrays
     */
    combineArrays(array, elements) { }
    /**
     * Checks if an Array contains all Elements of another given Array
     * @param  {Object[]} array
     * @param  {Object[]} elements The Elements to search for in the Array
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean} Returns true if all Elements are contained in the given Array
     */
    containsAll(array, elements, compare) { }
    /**
     * Checks if an Array contains at least one Element of another given Array
     * @param  {Object[]} array
     * @param  {Object[]} elements The Elements to search for in the Array
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean}  Returns true if at least one Element is contained in the given Array
     */
    containsOne(array, elements, compare) { }
    /**
     * Checks if an Array contains the given Element
     * @param  {Object[]} array
     * @param  {Object} element
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean}  Returns true if the Element is contained in the Array
     */
    containsElement(array, element, compare) { }
    /**
     * Returns the missing Elements in the Array
     * @param  {Object[]} array
     * @param  {Object[]} elements The Array that contains the Elements to search for
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Object[]}  An Array containing the missing Elements
     */
    missingElements(array, elements, compare) { }
    /**
     * Removes the Elements of one Array of another Array
     * @param  {Object[]} array
     * @param  {Object[]} elements	The Array that contains the Elements to remove
     * @param  {Function} compare	A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Array}	A Copy of the Array that does not contain the removed Elements
     */
    removeElements(array, elements, compare) { }
    /**
     * Returns the Elements that differ are contained in only one of the given Arrays
     * @param  {Object[]} array
     * @param  {Object[]} elements
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Object[]}	An Array that contains the Elements that were only present in one of the Arrays
     */
    difference(array, elements, compare) { }
    /**
     * Removes undefined and null entries from an Array
     * @param  {Object[]} array
     * @return {Object[]} A Copy of the Array with any undefined or null entries removed
     */
    removeUndefined(array) { }
    /**
     * Parse an Array of Objects to an Array of a single chosen Properties
     * @param  {Object[]}  array      Array to Parse
     * @param  {String}  attribute  Name of the Property that should be parsed
     * @param  {Boolean} isFunction Check when the Property is a function
     * @return {Object[]}  Parsed Array
     */
    parseAttribute(array, attribute, isFunction) { }
    /**
     * Gets the Index of an Object in an Array or -1 if it is not contained
     * @param  {Object[]} array
     * @param  {Object} element
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Integer}         [description]
     */
    getIndex(array, element, compare) { }
    /**
     * Creates an Array containing the given Element or returns immediately if an Array is given
     * @param  {Object[] | Object} element
     * @return {Object[]} An Array containing the given Elements
     */
    createArray(element) { }
    /**
     * Creates a Set of the given Array, removing any Duplicates
     * @param  {Object[]} array
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Object[]}  The Set representation of the given Array
     */
    toSet(array, compare) { }
}
/**
 * @mixin channel
 */
class channel {
    /**
     * Returns a String Representation of a Channel
     * @param  {Channel} channel
     * @return {String}	A String Representation of the given Channel
     */
    toString(channel) { }
    /**
     * Returns an Array of Channels which meet the provided criterias
     * @param  {String} attribute The Attribute to search for. E.g. 'name' or 'id'
     * @param  {String} value     The Value that should get compared with the Attribute
     * @param  {Channel[]} channels  Optional: The Channel Searchpool. If not provided all Channels will get used [Not Optional if compare gets provided]
     * @param  {Function} compare   Optional: A Function for how to compare the Value with the Attribute. If not provided Value and Attribute will get checked for equality
     * @return {Channel[]}           The Channels that matches the criterias
     */
    getChannels(attribute, value, channels, compare) { }
    /**
     * Returns all Subchannels of a given Channel
     * @param  {Channel} parentChannel The Channel to return the Subchannels of
     * @return {Channel[]}  Array containing all Subchannels of the given Channel
     */
    getSubChannels() { }
}
/**
 * @mixin channelGroup
 */
class channelGroup {
    /**
     * Returns a String Representation of a ChannelGroup
     * @param  {ChannelGroup} channelGroup
     * @return {String}	A String Representation of the given ChannelGroup
     */
    toString(channelGroup) { }
}
/**
 * @mixin comparator
 */
class comparator {
    /**
     * Checks if a is equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is equal b
     */
    equal(a, b) { }
    /**
     * Checks if a is not equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is not equal b
     */
    unequal(a, b) { }
    /**
     * Checks if a is greater b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is greater b
     */
    greater(a, b) { }
    /**
     * Checks if a is greater or equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is greater or equal b
     */
    greaterEqual(a, b) { }
    /**
     * Checks if a is less or equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is less or equal b
     */
    lessEqual(a, b) { }
    /**
     * Checks if a is less b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is less b
     */
    less(a, b) { }
    /**
     * Checks if one String is contained in another
     * @param  {String} a
     * @param  {String} b
     * @return {Boolean}   Returns true when String b is contained in String a
     */
    contains(a, b) { }
    /**
     * Checks if one String is contained in another, ignoring the Case
     * @param  {String} a
     * @param  {String} b
     * @return {Boolean}   Returns true when String b is contained in String a
     */
    containsIgnoreCase(a, b) { }
}
/**
 * @mixin general
 */
class general {
    /**
     * Logs messages to the Sinusbot Webinterface instance console, depending on the set log level in the config
     * @param  {String} message  The String to print
     * @param  {Integer} logLevel log level of the message to check with the set log level
     */
    log(message, logLevel) { }
    /**
     * Provides the active Bot instances running on the Sinusbot Installation [Important: All instances need to run the script]
     * @return {Client[]} Returns all found Bot clients in a Array
     */
    getBots() { }
}
/**
 * @mixin helper
 */
class helper {
    /**
     * Returns a String Representation of an Object
     * @param  {Object} object
     * @return {String}	A String Representation of the given Object
     */
    printObject(object) { }
    /**
     * Checks if the value is a Number
     * @param  {Object}  number Object that should be checked
     * @return {Boolean}        Returns true if the Object is a Number
     */
    isNumber(number) { }
    /**
     * Compares an objects property with a specific value
     * @param  {Object} object   Object to check
     * @param  {String} property Name of the Property that should be checked
     * @param  {Object} element  Value that should be compared to the Property
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean}   Returns the Value of the Comparison
     */
    objectFunctionEqualsElement(object, property, element, compare) { }
}
/**
 * @mixin playlist
 */
class playlist {
    /**
     * Returns a String Representation of a Playlist
     * @param  {Playlist} playlist
     * @return {String}	A String Representation of the given Playlist
     */
    toString(playlist) { }
}
/**
 * @mixin track
 */
class track {
    /**
     * Returns a String Representation of a Track
     * @param  {Track} track
     * @return {String}	A String Representation of the given Track
     */
    toString(track) { }
}