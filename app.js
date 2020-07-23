let budgetController=( function(){
    let Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    

    let Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    let calculateTotal=function(type){
            let sum=0;
            data.allItems[type].forEach(function(cur){  
                sum+=cur.value; 
            });
            data.totals[type]=sum;
    };
    let data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
return {
    //type here is either +income or -expense
    addItem:function(type,des,val){

            let newItem,ID;
            // We want the ID to be the next position of the
            // last element in the type array. ID=lastID+1
            if(data.allItems[type].length>0){
                ID= data.allItems[type][data.allItems[type].length-1].id+1;        
                
            }
            else{
                ID=0;
            }
            if(type==='exp')
            {
                newItem=new Expense(ID,des,val);

            }
            else if(type==='inc'){
                newItem=new Income(ID,des,val);
            }
            //push the new element to the data strcture
            data.allItems[type].push(newItem); 
            return newItem;
    },
    // Calculate Budget is accessed public by the use of private functions of calculate total
    calculateBudget:function(){
        calculateTotal('exp');
        calculateTotal('inc');
        data.budget=data.totals.inc - data.totals.exp;
        if(data.totals.inc>0){
        data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
        }
        else{
            data.percentage=-1;
        }

    },
    getBudget:function(){
        return{
            budget:data.budget,
            totalInc:data.totals.inc,
            totalExp:data.totals.exp,
            percentage:data.percentage
        }
    },
    calculatePercentages: function() {
        data.allItems.exp.forEach(function(cur) {
            cur.calcPercentage(data.totals.inc);
         });
    },
    getPercentages: function() {
        let allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
        });
        return allPerc;
    },
    deleteItem:function(type,id){
        let ids,index;
        // ids is a brand new array of elements of the current ids
       ids= data.allItems[type].map(function(current){
            return current.id;
        });
        index=ids.indexOf(id);
        if(index!==-1)
        {
            //splice takes 2 arguments first is position and 2nd is no. of elements
            data.allItems[type].splice(index,1);
        }

    },
     testing:function()
    {
        console.log(data);
    }
};
})();
// UI Controller -------------------------------------------------------
let UIController=(function(){
    // All buttons variables
    let DOMstrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputButton:'.add__btn',
        //income and expense container are the classes that holds the child item that added to the UI
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',

        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    let formatNumber= function(num,type)
           {
               let numSplit,int,dec;
               num=Math.abs(num);
               // Although numbers and strings are primitive data type
               //but we can use them as methods by the prototype so JS consider them as objects

               num=num.toFixed(2);
               numSplit=num.split('.');
               //int and dec here is strings
               int =numSplit[0];
               dec=numSplit[1];
               if(int.length > 3 ){
                   //input 2310 --> 2,310
                    int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);


               }
               return (type==='exp'? sign='-':sign='+') + ''+int+'.'+dec;


           };
           let nodeListForEach=function(list,callback)
           {
               for(let i=0;i<list.length;i++)
               {
                   callback(list[i],i);
               }
           };
    //Here is the public functions
    return{
        getInput:function(){
            return{
                // Will either be increment or decrement
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }; 
        },
        // addListItem is to add the items to the UI
        addListItem:function(obj,type){
        let html, newHtml, element;
        // Create HTML string with placeholder text        
        if (type === 'inc') {
            element = DOMstrings.incomeContainer;
            // %id% to override the income element dynamically with the obj
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        //html here is a string so we can use all the string methods
        newHtml=html.replace('%id%',obj.id);
        newHtml=newHtml.replace('%description%',obj.description);
        newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
        // Here we add to the container of element the newHtml last child
        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        }
        , 
        deleteListItem:function(selectorID){
            //child is income-0 and parent is container
                let childElement=document.getElementById(selectorID);
                childElement.parentNode.removeChild(childElement);
        },
        getDOMStrings:function(){
                return DOMstrings;
            },
        clearFields:function(){
            let fields,fieldsArray;
           fields= document.querySelectorAll
           (DOMstrings.inputDescription+','+DOMstrings.inputValue);
           // Query selector returns list so we wnt to change it to array
           //by tricking and dealing the fields list as array 
           fieldsArray=Array.prototype.slice.call(fields);
           // Here i want to clear all the fields of current element to be none 
           fieldsArray.forEach(function(current){
            current.value="";
            

           });
           // TO focus on the begining of the form inputs
           fieldsArray[0].focus();
        },
           displayBudget:function(obj){
               let type;
               obj.budget >0 ? type='inc' : type='exp';
                document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
                document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
                document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
               
                if(obj.Percentage>0)
                {
                    document.querySelector(DOMstrings.percentageLabel).textContent
                    =obj.Percentage+'%';
                }
                else{
                    document.querySelector(DOMstrings.percentageLabel).textContent
                    ='---';
                }
           },
           displayPercentages:function(percentages){
               let fields=document.querySelectorAll(DOMstrings.expensesPercLabel);
               // Note that every element in the tree node is stored as node list
              
               nodeListForEach(fields,function(current,index)
               {
                   if(percentages[index]>0){
                current.textContent=percentages[index] + '%';
                   }
                   else{
                    current.textContent='---';
                   }
               });
           },
           displayMonth:function(){
               let now,day,month,year,months;
               now=new Date(); 
               day=now.getDay();
               months=['January','Feburary','March','April','May','June','July','August','September','October','Novemeber','December'];
               month=now.getMonth();

               year=now.getFullYear();
               document.querySelector(DOMstrings.dateLabel)
               .textContent=months[month]+'  '+year;

           },
           // Chnage the colour of the Expense interface
           changedType: function() {
            
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton)
            .classList.toggle('red');
        }
          
       
    };
})();
// Main Controller ---------------------------------------------------------
let controller=(function(bugtCtrl,UCtrl){
    let setUpEventListeners=function(){
        let DOM=UIController.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(e){
    if( e.keyCode===13 || e.which===13)
    {
        ctrlAddItem();
    }
});
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    document.querySelector(DOM.inputType)
    .addEventListener('change',UCtrl.changedType);

 };

 let updateBudget=function(){
     //calculate the budget each item an it em is added
     bugtCtrl.calculateBudget();
     // return the budget to be used in the UI
     let budget=bugtCtrl.getBudget();
        // Display the budget on UI
     UCtrl.displayBudget(budget);
     
 };
 let updatePercentages = function() {
        
    // 1. Calculate percentages
    bugtCtrl.calculatePercentages();
    
    // 2. Read percentages from the budget controller
    let percentages = bugtCtrl.getPercentages();
    
    // 3. Update the UI with the new percentages
    // UCtrl.displayPercentages(percentages);
    UCtrl.displayPercentages(percentages);
};

 // Control Center Function that happens when we either click on add or ENter in keyboard 
    let ctrlAddItem=function(){
        let input,newItem;
        // Get the input data 
         input=UIController.getInput();
         if(input.description!=="" && !isNaN(input.value) && input.value>0)
         {
        // Add item to the budget controller
         newItem=bugtCtrl.addItem(input.type,input.description,input.value);
         //Add the list item to the UI
         UCtrl.addListItem(newItem,input.type);
         //for clear the fields
         UCtrl.clearFields();
        //Calculate and update budget
         updateBudget();


         updatePercentages();
         }
    };
    let ctrlDeleteItem=function(event){
            let itemID,type,ID;
            // We traversed the DOM to the element we want to delete
            itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
            if(itemID)
            {
                //split of inc-1 is inc , 1
                splitID=itemID.split('-');
                type=splitID[0];
                // As the splitID is a string not a number
                ID=parseInt(splitID[1]);

                
                bugtCtrl.deleteItem(type,ID);


                UCtrl.deleteListItem(itemID);
                //AFter this function returns the data strcture deletes the selected element
                updateBudget();
               
                
            }
    }
    return {
        init: function(){
            console.log('App has started');
            UCtrl.displayMonth();
            UCtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage: -1
            });
            //Is the function that if we press enter or add button will cal the ctrlAddItem function
            setUpEventListeners();
        }
    }
})(budgetController,UIController);

//Main function
controller.init();




