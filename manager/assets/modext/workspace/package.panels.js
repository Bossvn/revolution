/**
 * The panel who shows before package installation
 *
 * @class MODx.panel.PackageMetaPanel
 * @extends MODx.Tabs
 * @param {Object} config An object of options.
 * @xtype modx-package-metapanel
 */
MODx.panel.PackageMetaPanel = function(config) {
	config = config || {};

	Ext.applyIf(config,{
		cls: 'vertical-tabs-panel wrapped'
		// same as in parent class
		// ,headerCfg: { tag: 'div', cls: 'x-tab-panel-header vertical-tabs-header' }
		// ,bwrapCfg: { tag: 'div', cls: 'x-tab-panel-bwrap vertical-tabs-bwrap' }
		// ,defaults: {
		// 	bodyCssClass: 'vertical-tabs-body'
		// 	,autoScroll: true
		// 	,autoHeight: true
		// 	,autoWidth: true
		// }
		// ,layoutOnTabChange: true
		// ,listeners:{
			// tabchange: function(tb, pnl){
			// 	w = this.bwrap.getWidth();
			// 	this.body.setWidth(w);
			// 	this.doLayout();
			// }
			// ,scope: this
		// }
		,items: []
	});
	MODx.panel.PackageMetaPanel.superclass.constructor.call(this,config);
};
Ext.extend(MODx.panel.PackageMetaPanel,MODx.VerticalTabs,{
	updatePanel: function(meta, record){
		if(meta.changelog != undefined){
			this.addTab(_('changelog'), 'changelog', meta);
		}
        if(meta.requires != undefined){
            this.addDependenciesTab('Dependencies', 'dependencies', meta, record);
        }
		if(meta.readme != undefined){
			this.addTab(_('readme'), 'readme', meta);
		}
		if(meta.license != undefined){
			this.addTab(_('license'), 'license', meta);
		}
		this.setActiveTab(0);
		Ext.getCmp('modx-content').doLayout();
	}

	,addTab: function(title, id, data){
	    var tab = this.getItem(id);
	    if (!tab) {
            this.add({
                title: title
                ,xtype:'modx-template-panel'
                ,id: id +'-tab'
                ,markup: '{'+id+'}'
                ,bodyCssClass: 'meta-wrapper'
                ,listeners: {
                    afterrender: function() {
                        this.updateDetail( data );
                    }
                }
            });
        } else {
            tab.updateDetail(data);
        }
    }
    ,addDependenciesTab: function(title, id, data, pkgInfo){
        var tab = this.getItem(id);
        if (!tab) {
            this.add({
                title: title
                ,xtype:'modx-panel-package-dependencies'
                ,metaPanel: this
                ,pkgInfo: pkgInfo
                ,id: id +'-tab'
                ,height: '1000px'
            });
        } else {
            Ext.getCmp('modx-grid-package-dependencies').refresh();
        }
    }
});
Ext.reg('modx-package-meta-panel',MODx.panel.PackageMetaPanel);


/**
 * The panel who shows before package installation
 *
 * @class MODx.panel.PackageBeforeInstall
 * @extends MODx.panel.PackageMetaPanel
 * @param {Object} config An object of options.
 * @xtype modx-package-beforeinstall
 */
MODx.panel.PackageBeforeInstall = function(config) {
    config = config || {};
	this.setupOptions = null;

	Ext.applyIf(config,{});
	MODx.panel.PackageBeforeInstall.superclass.constructor.call(this,config);
};
Ext.extend(MODx.panel.PackageBeforeInstall, MODx.panel.PackageMetaPanel,{
	activate: function(){
		Ext.getCmp(this.ownerCt.id).getLayout().setActiveItem(this.id);
		this.removeAll();
	}
	
	,updateBreadcrumbs: function(msg, title){
        var bc = Ext.getCmp('packages-breadcrumbs');
        var bd = bc.getData();

        bd.text = msg;

        bd.trail.shift();

		bd.trail.push({
			text : title
		});

		bc.updateDetail(bd);
	}

	,updatePanel: function(meta, record){
		this.updateBreadcrumbs(_('license_agreement_desc'), _('install') + ' ' + record.data.name);
        Ext.getCmp('package-list-reset').show();
		Ext.getCmp('package-install-btn').hide();
		Ext.getCmp('package-show-setupoptions-btn').hide();
		if(meta.changelog != undefined){
			this.addTab(_('changelog'), 'changelog', meta);
		}
        if(meta.requires != undefined){
            this.addDependenciesTab('Dependencies', 'dependencies', meta, record);
        }
		if(meta.readme != undefined){
			this.addTab(_('readme'), 'readme', meta);
		}
		if(meta.license != undefined){
			this.addTab(_('license'), 'license', meta);
		}

		if(meta['setup-options'] != null && meta['setup-options'] != ''){
			Ext.getCmp('package-show-setupoptions-btn').show();
			this.setupOptions = meta['setup-options'];
		} else {
			Ext.getCmp('package-install-btn').show();
		}
		this.setActiveTab(0);
		Ext.getCmp('modx-content').doLayout();
	}

	,getOptions: function(){
		return this.setupOptions;
	}
});
Ext.reg('modx-package-beforeinstall',MODx.panel.PackageBeforeInstall);

/**
 * The panel to view package detail
 *
 * @class MODx.panel.PackageDetails
 * @extends MODx.Panel
 * @param {Object} config An object of options.
 * @xtype modx-package-browser-details
 */
MODx.panel.PackageDetails = function(config) {
    config = config || {};

	Ext.applyIf(config,{
		layout: 'column'
		,border: false
		,autoHeight: true
		,items:[{
			xtype: 'modx-template-panel'
			,id: 'modx-package-details-metas'
			,columnWidth: 1
			,markup: '<div class="details">'
				+'<tpl for=".">'
					+'<tpl if="readme">'
						+'<div class="item">'
							+'<h4>'+_('readme')+'</h4>'
							+'{readme}'
						+'</div>'
					+'</tpl>'
					+'<tpl if="changelog">'
						+'<div class="item">'
							+'<h4>'+_('changelog')+'</h4>'
							+'{changelog}'
						+'</div>'
					+'</tpl>'
					+'<tpl if="license">'
						+'<div class="item">'
							+'<h4>'+_('license')+'</h4>'
							+'{license}'
						+'</div>'
					+'</tpl>'
				+'</tpl>'
			+'</div>'
		},{
			xtype: 'modx-template-panel'
			,id: 'modx-package-details-aside'
			,cls: 'aside-details'
			,width: 250
			,markup: '<div class="details">'
				+'<tpl for=".">'
					+'<div class="selected">'
						+'<h5>{package_name}</h5>'
					+'</div>'
					+'<div class="infos description">'
						+'<h4>'+_('information')+'</h4>'
						+'<ul>'
							+'<li>'
								+'<span class="infoname">'+_('signature')+':</span>'
								+'<span class="infovalue">{signature}</span>'
							+'</li>'
							+'<li>'
								+'<span class="infoname">'+_('uploaded_on')+':</span>'
								+'<span class="infovalue">{created}</span>'
							+'</li>'
							+'<li>'
								+'<span class="infoname">'+_('installed')+':</span>'
								+'<span class="infovalue">{installed}</span>'
							+'</li>'
							+'<li>'
								+'<span class="infoname">'+_('last_updated')+':</span>'
								+'<span class="infovalue">{updated}</span>'
							+'</li>'
							+'<li>'
								+'<span class="infoname">'+_('provider')+':</span>'
								+'<span class="infovalue">{provider}</span>'
							+'</li>'
						+'</ul>'
					+'</div>'
				+'</tpl>'
			+'</div>'
		}]
	});
	MODx.panel.PackageDetails.superclass.constructor.call(this,config);
};
Ext.extend(MODx.panel.PackageDetails,MODx.Panel,{
	activate: function(){
		Ext.getCmp(this.ownerCt.id).getLayout().setActiveItem(this.id);
	}

	,updateBreadcrumbs: function(msg){
		Ext.getCmp('packages-breadcrumbs').updateDetail({
			 text : msg
			,trail : [{	text : _('package_details') }]
		});
	}

	,updateDetail: function(rec){
		this.updateBreadcrumbs(_('package_details_for',{'package': rec.package_name}));
		Ext.getCmp('modx-package-details-metas').updateDetail(rec);
		Ext.getCmp('modx-package-details-aside').updateDetail(rec);
	}
});
Ext.reg('modx-package-details',MODx.panel.PackageDetails);

MODx.panel.PackageDependencies = function(config) {
    config = config || {};
    Ext.apply(config,{
        border: false
        ,baseCls: 'modx-formpanel'
//        ,cls: 'container'
        ,items: [{
            html: '<h2>'+ 'Dependencies' +'</h2>'
            ,border: false
            ,cls: 'modx-page-header'
        },{
            xtype: 'modx-grid-package-dependencies'
            ,preventRender: true
            ,metaPanel: config.metaPanel
            ,pkgInfo: config.pkgInfo
            ,dependenciesPanel: this
            ,cls: 'main-wrapper'
        }]
    });
    MODx.panel.PackageDependencies.superclass.constructor.call(this,config);
};
Ext.extend(MODx.panel.PackageDependencies,MODx.Panel);
Ext.reg('modx-panel-package-dependencies',MODx.panel.PackageDependencies);

MODx.grid.PackageDependencies = function(config) {
    config = config || {};

    var cols = [];
    cols.push({ header: _('name') ,dataIndex: 'name', id:'main',renderer: { fn: this.mainColumnRenderer, scope: this } });
    cols.push({ header: _('version') ,dataIndex: 'version', id: 'meta-col', fixed:true, width:90 });
    cols.push({ header: _('release') ,dataIndex: 'release', id: 'meta-col', fixed:true, width:90 });
    cols.push({ header: _('installed') ,dataIndex: 'installed', id: 'info-col', fixed:true, width: 160 ,renderer: this.dateColumnRenderer });
    cols.push({ header: _('provider') ,dataIndex: 'provider_name', id: 'text-col', fixed:true, width:120 });


    Ext.applyIf(config,{
        id: 'modx-grid-package-dependencies'
        ,baseParams: {
            action: 'workspace/packages/getdependencies'
            ,signature: config.pkgInfo.data.signature
        }
        ,paging: false
        ,loadMask: true
        ,tbar: []
        ,width: config.metaPanel.bwrap.getWidth() - 50
        ,columns: cols
    });
    MODx.grid.PackageDependencies.superclass.constructor.call(this,config);
};
Ext.extend(MODx.grid.PackageDependencies,MODx.grid.Package, {
    mainColumnRenderer:function (value, metaData, record, rowIndex, colIndex, store){
        var rec = record.data;
        var state = (rec.installed !== null) ? ' installed' : ' not-installed';
        var values = { name: value, state: state, actions: null };

        var h = [];
        if(rec.installed == null) {
            h.push({ className:'install primary', text: rec.textaction });
        }
        if (rec.updateable) {
            h.push({ className:'update orange', text: _('package_update_action_button') });
        } else {
            if( rec.provider != 0 ){
                h.push({ className:'checkupdate', text: _('package_check_for_updates') });
            }
        }
        values.actions = h;
        return this.mainColumnTpl.apply(values);
    }
});
Ext.reg('modx-grid-package-dependencies',MODx.grid.PackageDependencies);

