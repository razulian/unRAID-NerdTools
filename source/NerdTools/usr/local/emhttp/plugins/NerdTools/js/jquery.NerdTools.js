$(function(){
    // tablesorter options
    $('#tblPackages').tablesorter({
        sortList: [[0,0]],
        widgets: ['saveSort', 'filter', 'stickyHeaders', 'zebra'],
        widgetOptions: {
            stickyHeaders_filteredToTop: true,
            stickyHeaders_attachTo: null,
            stickyHeaders_offset: ($('#header').css("position") === "fixed") ? '90' : '0',
            filter_hideEmpty: true,
            filter_liveSearch: true,
            filter_saveFilters: true,
            filter_reset: '.reset',
            filter_functions: {
                '.filter-version': true,
                '.filter-downloaded': true,
                '.filter-installed': true
            }
        }
    });
 
    $.cookie('nerdtools_checkall', 'no', { expires: 3650 });
    $.cookie('nerdtools_packages_uninstall', '--uninstall', { expires: 3650 });
    $('#btnApply').click(Apply);

    var url = window.location.href.split("?");
    packageQuery(url[1]);
});

//list all available packages in a table
function packageQuery(force) {
    $('#tblPackages tbody').html("<tr><td colspan='6'><br><i class='fa fa-spinner fa-spin icon'></i><em>Please wait, retrieving plugin information ...</em></td><tr>");
    $.getJSON('/plugins/NerdTools/include/PackageQuery.php', {force: force}, function(data) {
        $('#tblPackages tbody').empty();
        var Ready;
        var Count = 0;
        var len = data.packages.length, i = 0;
        for (i; i < len; i++) {
            var Update;
            var Downloaded = data.packages[i].downloaded;
            var DownloadEQ = data.packages[i].downloadeq;
            var Installed  = data.packages[i].installed;
            var InstallEQ  = data.packages[i].installeq;
            var updatePkg  = data.packages[i].updatePkg;
            if (InstallEQ == Installed || !updatePkg){
                if (Installed == "yes"){
                    if (Downloaded == "no")
                        Update = "<span ><i class='installed fa fa-check-circle'></i> installed</span>";
                    else
                        Update = "<span><i class='uptodate fa fa-check'></i> up-to-date </span>";
                }else{
                    Update = "<span><i class='uninstalled fa fa-info-circle'></i> uninstalled </span>";
                }
            }else{
                Update = "<span ><a class='update'><i class='updateready fa fa-cloud-download'></i> update ready </a></span>";
                Ready = true;
            }

            if (DownloadEQ != Downloaded && updatePkg)
                Downloaded = 'old';

            var Checked = "";
            if (data.packages[i].config == "yes"){
                Checked = "checked";
                Count++;
           }

            $('#tblPackages tbody').append("<tr>"+
            "<td class='package' title='"+data.packages[i].desc+"'>"+data.packages[i].name+"</td>"+ // package name
            "<td>"+Update+"</td>"+ // package status
            "<td>"+data.packages[i].size+"</td>"+ // package size
            "<td>"+Downloaded+"</td>"+ // package downloaded
            "<td>"+Installed+"</td>"+ // package installed
            "<td>"+data.packages[i].actualpkgv+"</td>"+ // package dependents
            "<td><input class='pkgcheckbox' id='"+data.packages[i].pkgname+"' type='checkbox' "+Checked+">"+
            "<input class='pkgvalue' type='hidden' id='"+data.packages[i].pkgname+"_value' name='"+data.packages[i].pkgnver+"' value='"+data.packages[i].config+"'></td>"+
            "</tr>");
        }
        if (Ready)
            $('#btnApply').prop('disabled', false);

        // attach switch buttons to every package checkbox all at once
        $('.pkgcheckbox')
            .switchButton({
                labels_placement: 'right',
                on_label: 'On',
                off_label: 'Off'
            })
            .change(function() {
                $(this).parent().parent().find('.pkgvalue').val(this.checked ? "yes": "no");
                if (this.checked)
                    checkDepends();
                $('#btnApply').prop("disabled", false);
            });

        // attach submit to update ready
        $('.update').click(Apply);

        // restore filters
        var lastSearch = $('#tblPackages')[0].config.lastSearch;
        $('#tblPackages').trigger('update')
        .trigger('search', [lastSearch]);

        if (data.empty == true && Count > 0) {
            swal({
                title:'Downloaded Packages Missing!',
                text:'You either changed unRAID versions or deleted your downloaded packages. Click Download or the Apply button below to download and install your selected packages.',
                type:'warning',
                showCancelButton: true,
                confirmButtonColor: "#00AA00",
                confirmButtonText: 'Download',
                closeOnConfirm: true,},
                function(isConfirm) {
                    $('#btnApply').prop('disabled', false);
                    if(isConfirm)
                        Apply();
                    else
                        $('html, body').animate({
                            scrollTop: $("#btnApply").offset().top
                        }, 2000);
                }
            );
        }
    });
}

function Apply() {
        checkDepends();
        var Arg2 = (typeof $.cookie('nerdtools_packages_uninstall') === 'undefined') ? '' : '&arg2='+$.cookie('nerdtools_packages_uninstall');
        $.post('/update.php', $('#package_form').serializeArray(), function() {
                openBox('/plugins/NerdTools/scripts/packagemanager&arg1=--download'+ Arg2,
                            'Package Manager', 600, 900, true);
            }
        );
}

function checkDepends() {
    try {
        
        if ($('#tmux')[0].checked) {
            $('#ncurses-terminfo').switchButton({ checked: true });
            $('#ncurses-terminfo', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#expect')[0].checked) {
            $('#tcl').switchButton({ checked: true });
            $('#tcl', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#iotop')[0].checked) {
            $('#python2').switchButton({ checked: true });
            $('#python2', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#vim')[0].checked) {
            $('#libsodium').switchButton({ checked: true });
            $('#libsodium', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#borgbackup')[0].checked) {
            $('#python3').switchButton({ checked: true });
            $('#python3', '.pkgvalue').val('yes');
            $('#python-setuptools').switchButton({ checked: true });
            $('#python-setuptools', '.pkgvalue').val('yes');
            $('#llfuse').switchButton({ checked: true });
            $('#llfuse', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#irssi')[0].checked) {
            $('#utf8proc').switchButton({ checked: true });
            $('#utf8proc', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#mediainfo')[0].checked) {
            $('#libzen').switchButton({ checked: true });
            $('#libzen', '.pkgvalue').val('yes');
            $('#libmediainfo').switchButton({ checked: true });
            $('#libmediainfo', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
    try {
        if ($('#wget2')[0].checked) {
            $('#gpgme').switchButton({ checked: true });
            $('#gpgme', '.pkgvalue').val('yes');
            $('#lzlib').switchButton({ checked: true });
            $('#lzlib', '.pkgvalue').val('yes');
            $('#libassuan').switchButton({ checked: true });
            $('#libassuan', '.pkgvalue').val('yes');
        }
    } catch (error) {
        console.error('Error checkDepends' + error);
    }
}