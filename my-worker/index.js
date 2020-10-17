addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


/* Preprocessing Functions
*/
function remove_from_attribute(attribute, to_delete){
      
  var attr_arr = attribute.split(';');
  var json_attr = {};

  for (var i =0; i<attr_arr.length; i++){
    let attr = attr_arr[i].split(':'); 
    attr[0] = attr[0].trim(attr[0]);
    attr[1] = attr[1].trim(attr[1]);
    json_attr[attr[0]] = attr[1];
  }

  delete json_attr[to_delete];
  
  const attr_string = (
    Object.entries(json_attr).map(([key, val]) => `${key}:${val}`).join(';')
  );
  return attr_string;
}

function add_to_attribute(attribute, key, value ){
      
  var attr_arr = attribute.split(';');
  var json_attr = {};

  for (var i =0; i<attr_arr.length; i++){
    let attr = attr_arr[i].split(':'); 
    attr[0] = attr[0].trim(attr[0]);
    attr[1] = attr[1].trim(attr[1]);
    json_attr[attr[0]] = attr[1];
  }

  json_attr[key] = value;
  
  const attr_string = (
    Object.entries(json_attr).map(([key, val]) => `${key}:${val}`).join(';')
  );
  return attr_string;
}



// /*  Classes for Transformers below: 
// */
class ProfileTransformer {
  async element(element){
    
    if (element.hasAttribute('style')){
      let attribute =element.getAttribute('style');
      attribute = remove_from_attribute(attribute, 'display');

      element.setAttribute(
        'style',
        attribute
      )
    }
    
  }
}


class ImageTransformer {
  async element(element) {
    element.setAttribute('src', 'https://stefanvercillo.com/static/images/me6.jpg')
  }
}


class BodyTransformer {
  async element(element) {
    element.setAttribute(
      'style',
      "background-image:url('https://wallpapershome.com/images/pages/pic_h/3519.jpg')"
    )
  }
}

class TitleTransformer {
  async element(element) {
    element.setInnerContent('Stefan Vercillo')
  }
}

class SocialsTransformer {
  async element(element) {

    let attribute =element.getAttribute('style');
      
    attribute = remove_from_attribute(attribute, 'display');

    element.setAttribute(
      'style',
      attribute
    )

    element.append( 
      '<a href="https://www.linkedin.com/in/stefan-vercillo"><img src="https://www.flaticon.com/svg/static/icons/svg/174/174857.svg"></a>',
      { html: true })

    element.append(
      '<a href="https://github.com/svercillo"><img src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg"></a>',
      { html: true })

    element.append(
      '<a href="https://www.instagram.com/stefano.vercillo/"><img src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg"></a>',
      { html: true })
  }
}


class NameTransformer {
  async element(element) {
    element.setInnerContent('Stefan Vercillo :)')
  }
}




class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  
  async element(element) {
    this.links.forEach(l => {
      element.append(` <a href="${l.url}">${l.name}</a>`, { html: true })
    });
  }
}


// JSON array of relevant links used for this project
const link_arr = [
  {"name" : "Porfolio Website", "url" : "https://stefanvercillo.com" },
  {"name" : "Cute Puppy", "url" : "https://cf.ltkcdn.net/dogs/images/orig/236742-1600x1030-cutest-puppy-videos.jpg" },
  {"name" : "Even Cuter Puppy", "url" : "https://stefanvercillo.com/static/images/meme.jpg" },
]

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = request.url; 

  if (url.endsWith('/links') || url.endsWith('/links/')) {
    return new Response(JSON.stringify(link_arr), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    })
  }


  // fetch the static HTML page
  const staticHTML = await fetch(
    'https://static-links-page.signalnerve.workers.dev/static/html',
    {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      }
    },
  )
  
  // transfrom HTML page 
  const HTML_page = new HTMLRewriter()
    .on('body', new BodyTransformer())
    .on('div#profile', new ProfileTransformer())
    .on('img#avatar', new ImageTransformer())
    .on('h1#name', new NameTransformer())
    .on('div#social', new SocialsTransformer())
    .on('div#links', new LinksTransformer(link_arr))
    .on('title', new TitleTransformer()) 
    .transform(staticHTML)
    return HTML_page
}
