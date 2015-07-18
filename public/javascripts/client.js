
var app = angular.module('traceApp', [])


app.directive('qrcode', ['$window', function($window) {

    var canvas2D = !!$window.CanvasRenderingContext2D,
        levels = {
          'L': 'Low',
          'M': 'Medium',
          'Q': 'Quartile',
          'H': 'High'
        },
        draw = function(context, qr, modules, tile) {
          for (var row = 0; row < modules; row++) {
            for (var col = 0; col < modules; col++) {
              var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
                  h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));

              context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
              context.fillRect(Math.round(col * tile),
                               Math.round(row * tile), w, h);
            }
          }
        };

    return {
      restrict: 'E',
      template: '<canvas class="qrcode"></canvas>',
      link: function(scope, element, attrs) {
        var domElement = element[0],
            $canvas = element.find('canvas'),
            canvas = $canvas[0],
            context = canvas2D ? canvas.getContext('2d') : null,
            download = 'download' in attrs,
            href = attrs.href,
            link = download || href ? document.createElement('a') : '',
            trim = /^\s+|\s+$/g,
            error,
            version,
            errorCorrectionLevel,
            data,
            size,
            modules,
            tile,
            qr,
            $img,
            setVersion = function(value) {
              version = Math.max(1, Math.min(parseInt(value, 10), 10)) || 4;
            },
            setErrorCorrectionLevel = function(value) {
              errorCorrectionLevel = value in levels ? value : 'M';
            },
            setData = function(value) {
              if (!value) {
                return;
              }

              data = value.replace(trim, '');
              qr = qrcode(version, errorCorrectionLevel);
              qr.addData(data);

              try {
                qr.make();
              } catch(e) {
                error = e.message;
                return;
              }

              error = false;
              modules = qr.getModuleCount();
            },
            setSize = function(value) {
              size = parseInt(value, 10) || modules * 2;
              tile = size / modules;
              canvas.width = canvas.height = size;
            },
            render = function() {
              if (!qr) {
                return;
              }

              if (error) {
                if (link) {
                  link.removeAttribute('download');
                  link.title = '';
                  link.href = '#_';
                }
                if (!canvas2D) {
                  domElement.innerHTML = '<img src width="' + size + '"' +
                                         'height="' + size + '"' +
                                         'class="qrcode">';
                }
                scope.$emit('qrcode:error', error);
                return;
              }

              if (download) {
                domElement.download = 'qrcode.png';
                domElement.title = 'Download QR code';
              }

              if (canvas2D) {
                draw(context, qr, modules, tile);

                if (download) {
                  domElement.href = canvas.toDataURL('image/png');
                  return;
                }
              } else {
                domElement.innerHTML = qr.createImgTag(tile, 0);
                $img = element.find('img');
                $img.addClass('qrcode');

                if (download) {
                  domElement.href = $img[0].src;
                  return;
                }
              }

              if (href) {
                domElement.href = href;
              }
            };

        if (link) {
          link.className = 'qrcode-link';
          $canvas.wrap(link);
          domElement = link;
        }

        setVersion(attrs.version);
        setErrorCorrectionLevel(attrs.errorCorrectionLevel);
        setSize(attrs.size);

        attrs.$observe('version', function(value) {
          if (!value) {
            return;
          }

          setVersion(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('errorCorrectionLevel', function(value) {
          if (!value) {
            return;
          }

          setErrorCorrectionLevel(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('data', function(value) {
          if (!value) {
            return;
          }

          setData(value);
          setSize(size);
          render();
        });

        attrs.$observe('size', function(value) {
          if (!value) {
            return;
          }

          setSize(value);
          render();
        });

        attrs.$observe('href', function(value) {
          if (!value) {
            return;
          }

          href = value;
          render();
        });
      }
    };
  }]);
;

app.controller('traceCtrl', ['$scope', '$http', function($scope, $http) {
    
    $scope.results = [];

    var hash_code = (window.location.hash + '').replace("#", "");
    

    navigator.geolocation.getCurrentPosition(function(p) {
            // success callback fn
            var c = p.coords; 
            console.log(c);
            L.circleMarker([c.latitude, c.longitude]).addTo(map);
            map.setView([c.latitude, c.longitude], 16);
            $scope.latitude = c.latitude;
            $scope.longitude = c.longitude;

    })

    if (hash_code) {
      $scope.code = hash_code;
    }

    $scope.uploadFile = function(files) {
        var fd = new FormData();
        //Take the first selected file
        fd.append("file", files[0]);

        $http.post("/api/photo", fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
        }).success( function(info){
          console.log('success', info)
          $scope.filename = info;
        }).error( function(){
          console.log('success', arguments)
        } );

    };

    $http.get('/trace/' + $scope.code).
      success(function(data, status, headers, config) {
        $scope.results = data;
        window.results = data;
        render(data);

      }).
      error(function(data, status, headers, config) {

      });

    setTimeout( init_input_behaviour, 100);

    $scope.save = function(){
      console.log($scope.latitude, 'is the filename');
      var result = {
        description: $scope.description,
        activity: $scope.activity,
        latitude: parseFloat($scope.latitude),
        longitude: parseFloat($scope.longitude),
        date: new Date(),
        filename: $scope.filename
      };
      $scope.results.push(result);
      
      $http.post('/trace/' + $scope.code, result).
        success(function(data, status, headers, config) {

        });
    };

    $scope.update = function() {
      console.log($scope.code);
      if ($scope.code !== "") {
        $http.get('/trace/' + $scope.code).
          success(function(data, status, headers, config) {
            $scope.results = data;
            window.results = data;
            render(data);
            window.history.pushState("object or string", "Title", "/#" + $scope.code);
        }).error(function(data, status, headers, config) {});
      }
      else {
        window.history.pushState("object or string", "Title", "/");
      }
    };
    window.addEventListener("hashchange", function(){
      window.location.reload();

      //$scope.code = (window.location.hash + '').replace("#", "");
      //$scope.$apply();

    }, false);

}]);

var init_input_behaviour = function(){

  (function() {
    // trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
    if (!String.prototype.trim) {
      (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
          return this.replace(rtrim, '');
        };
      })();
    }

    [].slice.call( document.querySelectorAll( 'input.input__field' ) ).forEach( function( inputEl ) {
      // in case the input is already filled..
      if( inputEl.value.trim() !== '' ) {
        classie.add( inputEl.parentNode, 'input--filled' );
      }

      // events:
      inputEl.addEventListener( 'focus', onInputFocus );
      inputEl.addEventListener( 'blur', onInputBlur );

    } );

    function onInputFocus( ev ) {
      classie.add( ev.target.parentNode, 'input--filled' );
    }

    function onInputBlur( ev ) {
      if( ev.target.value.trim() === '' ) {
        classie.remove( ev.target.parentNode, 'input--filled' );
      }
    }

  })();

}
