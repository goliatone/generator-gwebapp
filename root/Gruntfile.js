'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var config = {
        name: '{%= name%}',
        app: 'app',
        assets:'assets',
        dist: 'dist'
    };

    try {
        config.src = require('./component.json').appPath || config.src;
    } catch (e) {}

    grunt.initConfig({
        config: config,
        livereload: {
            port: 35723
        },
        watch: {
            compass: {
                files: ['<%= config.app %>/sass/*.{scss,sass}'],
                tasks: ['compass:server']
            },
            livereload: {
                files: [
                    '<%= config.app %>/{,*/}*.html',
                    '{.tmp,<%= config.app %>}/styles/css/*.css',
                    '<%= config.app %>/{,*/}*.js',
                    '{.tmp,<%= config.app %>}/{,*/}*.js',
                    '.tmp/css/*.css',
                    '{.tmp,<%= config.app %>}/js/{,*/}*.js',
                    '<%= config.app %>/styles/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'dist')
                        ];
                    }
                }
            },
            dev: {
                options: {}
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                runnerPort: 9999
            },
            unit: {
                reporters: 'dots'
            },
            debug: {
                singleRun: false,
                browsers: ['Chrome']
            },
            ci: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= config.dist %>/<%= config.name %>.js': [
                        '.tmp/{,*/}*.js',
                        '<%= config.app %>/{,*/}*.js'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= config.dist %>/<%= config.name %>.min.js': [
                        '<%= config.dist %>/<%= config.name %>.js'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        './assets/*',
                        './styles/{,*/}*',
                        '<%= config.app %>/components/**/*',
                        '*.{ico,txt}',
                        '*.html',
                        '*.js',
                        '{,*/}*.css'
                    ]
                }]
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: './<%= config.app %>/components',
                    install: true,
                    verbose: true,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {},
                    layout: function(type, component) {
                        console.warn(type, component);
                        //grunt-bower-install wants to do component/type/file but
                        //we need component/file
                        var path = require('path');
                        var renamedType = type;
                        console.warn(path);
                        console.warn(type);
                        if (type === 'js') renamedType = '';
                        return path.join(component, renamedType);
                    }
                }
            }
        },
        compass: {
            options: {
                sassDir: '<%= config.app %>/sass',
                cssDir: '<%= config.app %>/styles/css',
                imagesDir: '<%= config.app %>/styles/images',
                javascriptsDir: '<%= config.app %>/js',
                fontsDir: '<%= config.app %>/styles/fonts',
                importPath: '<%= config.app %>/components',
                specify:['<%= config.app %>/sass/style.scss'],
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', [
        'clean:server',
        'compass:server',
        'livereload-start',
        'connect:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'connect:test',
        'karma:ci'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'test',
        'concat',
        'copy',
        'uglify',
    ]);

    grunt.registerTask('default', ['build']);
};