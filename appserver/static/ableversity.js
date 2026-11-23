(function(){
  var API='https://training-hub.ableversity.com:3000/api';
  var LIB='https://training-hub.ableversity.com:3000/api/library';
  var COUPON_URL='https://ableu.ableversity.com/course/splunk-user?coupon=Ableversity4Splunk';
  var SPLUNK_USER='splunk-user';
  document.querySelectorAll('.ab-tab').forEach(function(tab){
    tab.addEventListener('click',function(){
      document.querySelectorAll('.ab-tab').forEach(function(t){t.classList.remove('active')});
      document.querySelectorAll('.ab-content').forEach(function(c){c.classList.remove('active')});
      tab.classList.add('active');
      document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
    });
  });
  var catMeta={
    'Exam Blueprints':{icon:'\uD83D\uDCCB',cls:'ab-lib-cat-exam'},
    'SPL Reference':{icon:'\u26A1',cls:'ab-lib-cat-spl'},
    'SPL Reference & Cheatsheets':{icon:'\u26A1',cls:'ab-lib-cat-spl'},
    'Career Paths':{icon:'\uD83D\uDDFA\uFE0F',cls:'ab-lib-cat-career'},
    'Career Paths & Certifications':{icon:'\uD83D\uDDFA\uFE0F',cls:'ab-lib-cat-career'},
    'Resume Building':{icon:'\uD83D\uDCDD',cls:'ab-lib-cat-resume'},
    'Job Search':{icon:'\uD83D\uDCBC',cls:'ab-lib-cat-jobs'},
    'How-To Guides':{icon:'\uD83D\uDD27',cls:'ab-lib-cat-howto'},
    'How-To Guides & Tutorials':{icon:'\uD83D\uDD27',cls:'ab-lib-cat-howto'},
    'Official Documentation':{icon:'\uD83D\uDCD6',cls:'ab-lib-cat-docs'},
    'Community & Networking':{icon:'\uD83E\uDD1D',cls:'ab-lib-cat-community'},
    'Why Splunk':{icon:'\uD83D\uDE80',cls:'ab-lib-cat-why'},
    'Ableversity':{icon:'\u2B50',cls:'ab-lib-cat-ableversity'},
    'Case Studies':{icon:'\uD83D\uDCCA',cls:'ab-lib-cat-cases'},
    'Legal':{icon:'\u2696\uFE0F',cls:'ab-lib-cat-legal'}
  };
  function getCatMeta(cat){return catMeta[cat]||{icon:'\uD83D\uDCC4',cls:'ab-lib-cat-legal'};}
  function esc(s){if(!s)return'';var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
  function loadCourses(){
    fetch(API+'/courses',{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function(courses){
      document.getElementById('courses-count').textContent=courses.length;
      renderCourses(courses);
    }).catch(function(e){
      document.getElementById('courses-grid').innerHTML='<div class="ab-error">&#9888; Failed to load courses.</div>';
    });
  }
  function renderCourses(courses){
    var grid=document.getElementById('courses-grid');
    var search=document.getElementById('course-search').value.toLowerCase();
    var filtered=courses.filter(function(c){
      if(!search)return true;
      return(c.title||'').toLowerCase().includes(search)||(c.description||'').toLowerCase().includes(search)||(c.instructor||'').toLowerCase().includes(search)||(c.tags||[]).some(function(t){return t.toLowerCase().includes(search);});
    });
    if(filtered.length===0){grid.innerHTML='<div class="ab-loading">No courses found.</div>';return;}
    grid.innerHTML=filtered.map(function(course){
      var isF1=course.courseId===SPLUNK_USER;
      var diff=course.difficulty||'beginner';
      var lc=(course.lessons||[]).length;
      var dur=course.estimatedDuration||0;
      var price=course.price||0;
      var desc=(course.description||'').replace(/<[^>]*>/g,'').substring(0,140);
      var img=course.imageUrl?'<img class="ab-card-img" src="'+esc(course.imageUrl)+'" alt="'+esc(course.title)+'" onerror="this.outerHTML=\'<div class=ab-card-ph>&#128218;</div>\'">':'<div class="ab-card-ph">&#128218;</div>';
      return'<div class="ab-card">'+img+'<div class="ab-card-body"><div class="ab-card-title">'+esc(course.title)+'</div><div class="ab-card-meta"><span>'+esc(course.instructor||'Instructor')+'</span><span>'+lc+' lessons</span><span>'+dur+' min</span></div><div class="ab-card-desc">'+esc(desc)+(course.description&&course.description.replace(/<[^>]*>/g,'').length>140?'...':'')+'</div><div class="ab-card-tags"><span class="ab-tag ab-tag-'+esc(diff)+'">'+esc(diff)+'</span>'+(price===0?'<span class="ab-tag" style="background:#D1FAE5;color:#065F46">Free</span>':'<span class="ab-tag" style="background:#D1FAE5;color:#065F46">$'+price.toFixed(2)+'</span>')+'</div><div><a class="ab-btn ab-btn-primary" href="https://ableu.ableversity.com/course/'+esc(course.courseId)+'" target="_blank" rel="noopener">View Course &#8594;</a>'+(isF1?'<a class="ab-btn ab-btn-free" href="'+COUPON_URL+'" target="_blank" rel="noopener">&#127891; Start Free</a>':'')+'</div></div></div>';
    }).join('');
  }
  document.getElementById('course-search').addEventListener('input',function(){loadCourses();});
  var allDocs=[];
  var activeCat='All';
  function loadLibrary(){
    fetch(LIB,{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function(docs){
      allDocs=docs;
      document.getElementById('library-count').textContent=docs.length;
      renderLibCats();
      renderLibrary(docs);
    }).catch(function(e){
      document.getElementById('library-list').innerHTML='<div class="ab-error">&#9888; Failed to load library.</div>';
    });
  }
  function renderLibCats(){
    var cats=['All',...new Set(allDocs.map(function(d){return d.category;}).filter(Boolean))];
    var container=document.getElementById('lib-categories');
    container.innerHTML=cats.map(function(cat){
      var label=cat==='All'?'All ('+allDocs.length+')':cat;
      return'<button class="ab-lib-cat-btn'+(activeCat===cat?' active':'')+'" data-cat="'+esc(cat)+'">'+esc(label)+'</button>';
    }).join('');
    container.querySelectorAll('.ab-lib-cat-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        activeCat=btn.dataset.cat;
        container.querySelectorAll('.ab-lib-cat-btn').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        renderLibrary(allDocs);
      });
    });
  }
  function renderLibrary(docs){
    var container=document.getElementById('library-list');
    var search=document.getElementById('library-search').value.toLowerCase();
    var filtered=docs;
    if(activeCat!=='All')filtered=filtered.filter(function(d){return d.category===activeCat;});
    if(search)filtered=filtered.filter(function(d){return(d.title||'').toLowerCase().includes(search)||(d.description||'').toLowerCase().includes(search)||(d.category||'').toLowerCase().includes(search)||(d.tags||[]).some(function(t){return t.toLowerCase().includes(search);});});
    if(filtered.length===0){container.innerHTML='<div class="ab-loading">No documents found.</div>';return;}
    container.innerHTML='<div class="ab-lib-count">'+filtered.length+' of '+docs.length+' documents</div>'+
      filtered.map(function(doc){
        var meta=getCatMeta(doc.category);
        var links=doc.links||[];
        var firstLink=links.length>0?links[0]:null;
        return'<a class="ab-lib-item" href="'+(firstLink?esc(firstLink.url):'#')+'" target="_blank" rel="noopener"><div class="ab-lib-icon '+meta.cls+'">'+meta.icon+'</div><div style="flex:1;min-width:0"><div class="ab-lib-title">'+esc(doc.title||'Untitled')+'</div>'+(doc.description?'<div class="ab-lib-desc">'+esc(doc.description.substring(0,90))+'</div>':'')+'<div class="ab-lib-cat-label">'+esc(doc.category||'Uncategorized')+'</div></div></a>';
      }).join('');
  }
  document.getElementById('library-search').addEventListener('input',function(){renderLibrary(allDocs);});
  loadCourses();
  loadLibrary();
})();
