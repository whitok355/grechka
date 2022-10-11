"use strict";

let btnLikes = null;

const swiper = new Swiper('.swiper',{
    slidesPerView: 1,
    slidesPerGroup: 1,
    slideToClickedSlide: true,
    loop: false,
    speed: 2000,
    direction: 'horizontal',
    initialSlide: 1,
    effect: 'creative',
    creativeEffect: {
      next: {
        opacity: 0,
        translate: ['100%', 0, 0],
      },
      prev: {
        opacity: 1,
        translate: ['-99%', 0, 0],
      },
    },
    allowTouchMove: false,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
})

const getData ={
    renderSlides: function (){
        JSON.parse(localStorage.slides).forEach(slide =>{
            if(!document.getElementById(`slide-${slide.id}`)){
                swiper.appendSlide(createLayout(slide))
            }
        })
    },
    getSlides: async function  (api) {
        try{
            const response= await fetch(api);
            const data = await response.json();
            if(!localStorage.slides){
                localStorage.slides = JSON.stringify(data.data)
            } else{
                let localArr = JSON.parse(localStorage.slides);
                data.data.forEach(slide => {
                    let find = localArr.find(el => el.id === slide.id);
                    if(!find){
                        localArr.push(slide)
                        localStorage.slides = JSON.stringify(localArr)
                    }
                })
            } 
            this.renderSlides()
            likes();
        } catch(err){
            document.querySelector('.swiper-wrapper').innerHTML = createLayoutErr();
            document.querySelector('.swiper-wrapper').style.background = `lightgrey`;
            document.querySelector('.swiper-wrapper').style.width = '100%';
        }
    },
    setLikes: async function(find){
        try{
            const response = await fetch(`https://private-anon-4914accf3c-grchhtml.apiary-mock.com/slides/${find.id}/like`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify()
            });
            const data = await response.json()
            return true
        } catch(err){
            document.querySelector('.swiper-wrapper').insertAdjacentElement('beforeend', getPopUpErr())
            initBtnClose()
            return false
        }

    }
}

const localStor = {
    get: function(){
        return JSON.parse(localStorage.slides)
    },
    set: function(el){
        let localArr = this.get();
        let find = localArr.find(slide => slide.id == el.id);
        ++find.likeCnt
        localStorage.slides = JSON.stringify(localArr)
    },
    find: function(e){
       return this.get().find(slide => slide.id == e.currentTarget.id)
    }
}

function closer(){
    document.querySelector('.swiper-button-prev').style.display = 'flex';
    document.querySelector('.swiper-button-next').style.display = 'flex';
    document.querySelector('.pop-up').remove()
}

function initBtnClose(){
    document.querySelector('.pop-up-top__close').addEventListener('click', closer)
    document.querySelectorAll('.pop-up-el-closer').forEach(el=> el.addEventListener('click', closer))
}

function changeBtn(find){
    document.getElementById('hand').style.fill = '#999999';
    document.querySelector('.swiper-button-prev').style.display = 'none';
    document.querySelector('.swiper-button-next').style.display = 'none';
    initBtnClose()
}

function rendPopUp(find){
    document.querySelector('.swiper-wrapper').insertAdjacentElement('beforeend', getLayoutPopUp(find))
    if(document.querySelector('.pop-up')){
        changeBtn(find)
    }
}

function eventBtnLikes (e){
    let find = localStor.find(e)
    getData.setLikes(find).then(response => {
        if(response === false){
            changeBtn(find)
        } else{
            document.querySelector(`.value-${find.id}`).innerHTML = ++find.likeCnt;
            localStor.set(find)
            document.querySelector(`.likes-btn[id='${find.id}']`).setAttribute('disabled', true);
            rendPopUp(find)
        }
    })

}

function likes(){
    btnLikes = document.querySelectorAll('.likes-btn');
    btnLikes.forEach(btn => btn.addEventListener('click', eventBtnLikes))
}

getData.getSlides(`https://private-anon-4914accf3c-grchhtml.apiary-mock.com/slides?offset=3&limit=3`);

swiper.on('reachEnd', function(){
    getData.getSlides(`https://private-anon-4914accf3c-grchhtml.apiary-mock.com/slides?offset=6&limit=3`)
})
