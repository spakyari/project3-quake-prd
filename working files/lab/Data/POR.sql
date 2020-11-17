select ClosestCity, 
50/cast(max(sum(case when (category = 2) then 1 else 0 END),0.02) as float) as Mag20,  
50/cast(max(sum(case when (category = 2.5) then 1 else 0 END),0.02) as float) as Mag25,  
50/cast(max(sum(case when (category = 3.0) then 1 else 0 END),0.02) as float) as Mag30,  
50/cast(max(sum(case when (category = 3.5) then 1 else 0 END),0.02) as float) as Mag35,  
50/cast(max(sum(case when (category = 4.0) then 1 else 0 END),0.02) as float) as Mag40,
50/cast(max(sum(case when (category = 4.5) then 1 else 0 END),0.02) as float) as Mag45, 
50/cast(max(sum(case when (category = 5.0) then 1 else 0 END),0.02) as float) as Mag50, 
50/cast(max(sum(case when (category = 5.5) then 1 else 0 END),0.02) as float) as Mag55,
50/cast(max(sum(case when (category = 6.0) then 1 else 0 END),0.02) as float) as Mag60, 
50/cast(max(sum(case when (category = 6.5) then 1 else 0 END),0.02) as float) as Mag65, 
50/cast(max(sum(case when (category = 7.0) then 1 else 0 END),0.02) as float) as Mag70,
50/cast(max(sum(case when (category = 7.5) then 1 else 0 END),0.02) as float) as Mag75,
50/cast(max(sum(case when (category = 8.0) then 1 else 0 END),0.02) as float) as Mag80,      
50/cast(max(sum(case when (category = 8.5) then 1 else 0 END),0.02) as float) as Mag85,  
50/cast(max(sum(case when (category = 9.0) then 1 else 0 END),0.02) as float) as Mag90  
from quakes
group by ClosestCity
