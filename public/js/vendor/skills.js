if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

$.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined && this.attr(name) !== false;
};

$.fn.attrInt = function(name, dflt) {
    var theAttr = parseInt(this.attr(name));
    if (isNaN(theAttr) && typeof dflt != 'undefined')
        return dflt;
    else
        return theAttr;

};

String.prototype.randomColor = function() {

    var hash;
    var colour;
    for (var i = 0, hash = 0; i < this.length; hash = this.charCodeAt(i++) + ((hash << 5) - hash))
    ;
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2))
    ;

    return colour;
}

hexColorToGrayscale = function(str) {
    str = str.substr(1, 6);
    var r = parseInt(str.substr(0, 2), 16);
    var g = parseInt(str.substr(2, 2), 16);
    var b = parseInt(str.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq;
}


var skilltree = {
    buttons: '',
    skillpoints_dependency: true,
    skillpoints: 4,
    group_dependency_modifier: [],
    hint: '',
    size: 80,
    editorMode: false,
    downgradeDisabled: false,
    language: {
        reqTitle: 'Requirements for level {0}:',
        req: '<h4>{1}</h4><ul class="reqs">{0}</ul>',
        level: '<li class="{1}">{0}</li>',
        levelTitle: '{0} - Level {1}'
    },
    init: function(obj) {

        $(document).trigger('skillsInit', this);

        if (typeof obj == 'undefined')
            obj = $('body');

        var that = this;

        this.buttons = obj.find('.skill');
        this.hint = obj.find('.skillHint');

        if (typeof this.hint[0] == 'undefined') {
            obj.append('<div class="skillHint"></div>');
            this.hint = obj.find('.skillHint');
        }

        if (!this.editorMode) {
            this.buttons.click(function(e) {
                if (e.button == 0) {
                    if (!skilltree.checkSkillPointsAvailability())
                        return false

                    if ($(this).hasClass('available')) {
                        var current = $(this).attrInt('current');
                        var max = $(this).attrInt('max');

                        if (current < max) {
                            current = current + 1;
                            $(this).attr('current', current);
                            skilltree.updateSkillPoints(-1); // Decrementation of skillpoints.
                            that.render($(this));
                            that.renderAll();

                            $(document).trigger('skillsAfterChange', that);
                        }

                        that.rebuildHint($(this), e);
                    }
                }
                return false;

            });

            this.buttons.bind('contextmenu', function(e) {
                if (that.isDowngradePossible($(this))) {
                    var current = $(this).attrInt('current');
                    if (current > 0) {
                        current = current - 1;
                        $(this).attr('current', current);
                        skilltree.updateSkillPoints(1); // Incrementation of skillpoints.
                        that.render($(this));
                        that.renderAll();

                        $(document).trigger('skillsAfterChange', that);
                    }
                }
                return false;
            });


            // Showing and hiding the tooltip

            this.buttons.hover(
                function(e) {
                    that.rebuildHint($(this), e);
                },
                function() {
                    that.hint.html('');
                    that.hint.hide();
                }
            );

            //TODO: Check dimensions for tooltip
            // Moving the tooltip

            this.buttons.mousemove(function(e) {
                var pagey = e.pageY;
                if ($(window).height() < (e.pageY + that.hint.innerHeight())) {
                    pagey = e.pageY - (that.hint.innerHeight() - ($(window).height() - e.pageY));
                }
                that.hint.css({
                    left: e.pageX - $(window).width() / 7,
                    top: e.pageY - $(window).height() / 7
                });
            })

        }








        this.generateAbbrAll();
        this.renderAll();

        $(document).trigger('skillsAfterInit', this);

        return this;

    },
    rebuildHint: function(obj, e) {
        var hintDiv = obj.find('div');
        var current = this.getSkillLevel(obj);

        if (typeof hintDiv[0] != 'undefined') {
            this.hint.html(hintDiv.html());

            this.hint.find('[showlevel]').hide().filter(function() {
                    var showlevel = $(this).attr('showlevel');

                    if (showlevel.indexOf('-') != -1) {
                        var levels = showlevel.split('-');
                        if (current >= parseInt(levels[0]) && current <= parseInt(levels[1]))
                            return true;
                    }
                    else if (showlevel == current)
                        return true;
                    return false;
                })
                .show();
        }

        if (!obj.hasAttr('nohint') && (obj.hasAttr('dependency') || obj.hasAttr('group_dependency')) && !obj.hasClass('available') && current < obj.attrInt('max')) {
            this.hint.append(this.buildDependencyHint(obj));
        }

        this.hint.css({
            left: e.pageX - $(window).width() / 7,
            top: e.pageY - $(window).height() / 7
        });
        this.hint.show();
    },
    generateAbbrAll: function() {
        this.buttons.each(function() {

            skilltree.generateAbbr($(this));

        });
    },
    generateAbbr: function(elem) {
        if (!(elem.hasAttr('sprite')) && !(elem.hasAttr('sprites'))) {

            var abbr = '';
            if (elem.hasAttr('abbr'))
                abbr = elem.attr('abbr');
            else {
                if (elem.hasAttr('name'))
                    abbr = elem.attr('name').substr(0, 2);
                else if (elem.hasAttr('skillid'))
                    abbr = elem.attr('skillid').substr(0, 2);
                elem.attr('abbr', abbr);
            }

            if (abbr != '') {

                if (abbr.length > 2)
                    elem.addClass('sm');
                if (abbr.length >= 4)
                    elem.addClass('sm2');
                if (abbr.length >= 6)
                    elem.addClass('sm3');

                var color = '';
                if (elem.hasAttr('abbr_color'))
                    color = elem.attr('abbr_color');
                else
                    color = abbr.randomColor();

                var textColor = hexColorToGrayscale(color) < 128 ? 'color: #FFF;' : 'color: #444;';

                if (color != '')
                    color = ' style="background:' + color + ';' + textColor + '"';

                elem.append('<span class="abbr"' + color + '>' + abbr + '</span>');
            }
            elem.addClass('nosprite');
        }
    },
    buildDependencyHint: function(obj) {
        var nextLevel = this.getSkillLevel(obj) + 1;
        var deps = this.getDependency(obj, nextLevel);
        var deptext = '';
        for (name in deps) {
            level = deps[name];
            var metclass = this.getSkillLevel(name) >= level;
            deptext += this.language.level.format(this.language.levelTitle.format(this.getSkillName(name), level), metclass ? 'met' : 'unmet');
        }

        var group_deps = this.getGroupDependency(obj, nextLevel);
        for (name in group_deps) {
            level = group_deps[name];
            var metclass = this.getSkillLevel(name) >= level;
            var desc = 'Skills of group "' + name + '" required :';
            deptext += this.language.level.format(this.language.levelTitle.format(desc, level), metclass ? 'met' : 'unmet');
        }

        return this.language.req.format(deptext, this.language.reqTitle.format(nextLevel));

    },
    // Getting the level of skill

    getSkillLevel: function(skill) {
        if (typeof skill == "object")
            return skill.attrInt('current', 0);
        return $('[skillid=' + skill + ']').attrInt('current', 0);
    },
    getSkillName: function(skill) {
        var name;

        if (typeof skill == "object") {
            name = skill.attr('name');
            if (name == 'undefined')
                name = skill.attr('skillid');
        }
        else {
            name = $('[skillid=' + skill + ']').attr('name');
            if (name == 'undefined')
                name = skill;
        }
        return name;
    },
    // Getting and evauluating complex dependency for obj's level.
    getDependency: function(obj, level) {
        if (!obj.hasAttr('dependency'))
            return false;
        try {
            eval('var evalResult = {' + obj.attr('dependency') + '}');
        }
        catch (e) {
            obj.removeAttr('dependency');
            return false;
        }

        if (typeof level != 'undefined') {
            if (typeof evalResult[level] != 'undefined')
                return evalResult[level];
            else
                return false;
        }
        else
            return evalResult;
    },
    // Getting and evauluating complex group dependency for obj's level.
    getGroupDependency: function(obj, level) {
        if (!obj.hasAttr('group_dependency'))
            return false;
        try {
            eval('var evalResult = {' + obj.attr('group_dependency') + '}');
        }
        catch (e) {
            obj.removeAttr('group_dependency');
            return false;
        }

        if (typeof level != 'undefined') {
            if (typeof evalResult[level] != 'undefined')
                return evalResult[level];
            else
                return false;
        }
        else
            return evalResult;
    },
    // Getting and evauluating complex mustNotHave exclusion condition for obj's level.
    getMustNotHave: function(obj, level) {
        if (!obj.hasAttr('mustNotHave'))
            return false;
        try {
            eval('var evalResult = {' + obj.attr('mustNotHave') + '}');
        }
        catch (e) {
            obj.removeAttr('mustNotHave');
            return false;
        }

        if (typeof level != 'undefined') {
            if (typeof evalResult[level] != 'undefined')
                return evalResult[level];
            else
                return false;
        }
        else
            return evalResult;
    },

    getSprite: function(obj, level) {

        if (!obj.hasAttr('sprites') && !obj.hasAttr('sprite'))
            return false;

        var sprite = false;


        if (obj.hasAttr('sprite'))
            sprite = obj.attr('sprite').split('x');

        // TODO: Sprites for level ranges

        if (obj.hasAttr('sprites')) {
            try {
                eval('var evalResult = {' + obj.attr('sprites') + '}');
            }
            catch (e) {
                console.log('Error in evaluating', obj.attr('sprites'));
                var evalResult = false;
            }
            if (evalResult && level && evalResult[level])
                sprite = evalResult[level];
        }
        return sprite;
    },
    // Checking, if upgrade of obj to level forLevel is possible
    isDependencyMet: function(obj, forLevel) {
        // If we don't have enough skill points.
        if (!skilltree.checkSkillPointsAvailability())
            return false;

        var dep = this.getDependency(obj, forLevel);
        var mustHave = obj.attr('musthave');
        var group_dep = this.getGroupDependency(obj, forLevel);
        var mustNotHave = this.getMustNotHave(obj, forLevel);



        var group_dependencymet = true;
        if (group_dep != false) {
            for (var group in group_dep) {
                // Count group active skill quantity.
                var activeSkillFromGroup = 0;
                if (skilltree.group_dependency_modifier[group]) {
                    activeSkillFromGroup += skilltree.group_dependency_modifier[group];
                }
                this.buttons.filter('.active').each(function() {
                    if ($(this).attr('group') == group) {
                        activeSkillFromGroup++;
                    }
                });
                if (activeSkillFromGroup < parseInt(group_dep[group])) {
                    group_dependencymet = false;
                }
                if (!group_dependencymet)
                    break;
            }
        }

        var mustNotHave_dependencymet = true;
        if (mustNotHave != false) {
            for (var name in mustNotHave) {
                var lvl2 = mustNotHave[name];
                var lvl = this.getSkillLevel(name);
                if (lvl >= parseInt(mustNotHave[name])) {
                    mustNotHave_dependencymet = false;
                }
                if (!mustNotHave_dependencymet) {
                    break;
                }
            }
        }
        var dependencymet = true;
        if (dep != false) {
            for (var name in dep) {
                var lvl = this.getSkillLevel(name);
                if (lvl < parseInt(dep[name])) {
                    dependencymet = false;
                }
                if (!dependencymet)
                    break;
            }
        }
        else if (typeof mustHave == 'undefined' || typeof $('[skillid=' + mustHave + '].active')[0] != 'undefined') {
            dependencymet = true;
        }
        else {
            dependencymet = false;
        }

        if (dependencymet == true && mustNotHave_dependencymet == true && group_dependencymet == true)
            return true;
        else
            return false;
    },
    // Checking if downgrade is possible

    isDowngradePossible: function(obj) {

        if (this.downgradeDisabled)
            return false;

        var id = obj.attr('skillid');
        var levelFrom = obj.attrInt('current', 0);
        if (levelFrom <= 0)
            return false;

        if (typeof id == 'undefined')
            return true; // Always possible for skills with no id

        if (levelFrom == 1 && typeof this.buttons.filter('.active[musthave=' + id + ']')[0] != 'undefined') {
            return false;
        }

        var isPossible = true;
        var that = this;
        this.buttons.filter('.active[dependency]').each(function() {
            var dep = that.getDependency($(this));
            var current = $(this).attrInt('current');
            if (dep != false) {
                for (var lvl in dep) {
                    if (parseInt(lvl) <= current) {
                        if (typeof dep[lvl][id] != 'undefined' && dep[lvl][id] >= levelFrom) {
                            isPossible = false;
                            return false
                        }
                    }
                }
            }
        });
        this.buttons.filter('.active[group_dependency]').each(function() {
            var my_id = $(this).attr('id');
            var group_dep = that.getGroupDependency($(this));
            var current = $(this).attrInt('current');
            if (group_dep != false) {
                for (var lvl in group_dep) {
                    $.each(group_dep[lvl], function(group, lvl_required) {
                        var activeSkillFromGroup = 0;
                        if (skilltree.group_dependency_modifier[group]) {
                            activeSkillFromGroup += skilltree.group_dependency_modifier[group];
                        }
                        $('.skill.active').each(function() {
                            if ($(this).attr('id') != my_id && $(this).attr('id') != id) {
                                if ($(this).attr('group') == group) {
                                    var canIncrementActiveSkill = false
                                    if ($(this).is('[group_dependency]')) {
                                        var group_dep_trouver = that.getGroupDependency($(this));
                                        $.each(group_dep_trouver[1], function(group_trouver, lvl_trouver_required) {
                                            if (group_trouver == group && lvl_trouver_required < lvl_required) {
                                                canIncrementActiveSkill = true;
                                            }
                                        });
                                    }
                                    else {
                                        canIncrementActiveSkill = true;
                                    }

                                    if (canIncrementActiveSkill == true) {
                                        activeSkillFromGroup++;
                                    }
                                }
                            }
                        });
                        if (parseInt(lvl_required) > activeSkillFromGroup) {
                            isPossible = false;
                            return false
                        }
                    });
                }
            }
        });
        return isPossible;
    },
    // Checking things and updating single skill (obj)

    render: function(obj) {

        // Getting current and max numbers

        var current = obj.attrInt('current');

        if (isNaN(current) || current < 0) {
            current = 0;
            obj.attr('current', 0);
        }
        var max = parseInt(obj.attr('max'));
        if (isNaN(max) || current < 0) {
            max = 1;
            obj.attr('max', 1);
        }

        // Adding status display div

        var status = obj.find('.status');
        if (typeof status[0] == 'undefined') {
            obj.append('<span class="status"></span>');
            status = obj.find('.status');
        }
        status.html(current + '/' + max);

        // Modifying the sprite if any

        var sprite = this.getSprite(obj, current);
        if (sprite != false)
            obj.css('background-position', skilltree.getSpriteBackgroundPosition(sprite[0], sprite[1]));

        // Making already upgraded active

        if (current > 0)
            obj.addClass('active');
        else
            obj.removeClass('active');

        // Checking if upgrade to next level is possible

        if (current < max) {
            if (this.isDependencyMet(obj, current + 1))
                obj.addClass('available');
            else
                obj.removeClass('available');
        }
        else if (current >= max)
            obj.removeClass('available');

        return this;

    },
    // Checking stuff and rendering all elements

    renderAll: function() {
        var that = this;
        this.buttons.each(
            function() {
                that.render($(this));
            }
        );
        $(document).trigger('skillsAfterRender', that);
    },
    // Getting CSS for sprite

    getSpriteBackgroundPosition: function(x, y) {
        return '-' + (parseInt(x) * this.size) + 'px -' + (parseInt(y) * this.size) + 'px'
    },

    // Check skill points availability before level-up skill.
    checkSkillPointsAvailability: function() {
        var availability = true;
        if (this.skillpoints_dependency == true && this.skillpoints <= 0) {
            availability = false;
        }
        return availability;
    },
    updateSkillPoints: function(value) {
        if (this.skillpoints_dependency == true) {
            this.skillpoints += value;
        }
        $('#skillpoints').text(this.skillpoints);
        return this.skillpoints;
    },

    // Export/import as JSON
    export: function() {

        var json = '{';

        var attrs = [];

        this.buttons.filter('.active').each(function() {
            attrs.push('"' + $(this).attr('skillid') + '":' + $(this).attrInt('current'))
        });


        json += attrs.join(',');
        json += '}';

        return json;
    },
    import: function(json) {
        if (typeof json == 'string')
            json = JSON.parse(json);
        this.buttons.each(function() {
            var id = $(this).attr('skillid');
            if (typeof json[id] != 'undefined')
                $(this).attr('current', json[id]);
            else
                $(this).attr('current', 0);
        });
        this.renderAll();
    }
};
